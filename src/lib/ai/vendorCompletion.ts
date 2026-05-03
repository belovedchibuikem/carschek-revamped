/** Replaces `@rocketnew/llm-sdk` for production builds — OpenAI-style responses/stream chunks. */

export type ChatMessage = { role: string; content: string };

type CompletionArgs = {
  provider: string;
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  api_key: string;
};

function coerceContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return '';
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

export function normalizeMessages(raw: unknown[]): ChatMessage[] {
  return raw.map((m: any) => ({
    role: String(m.role || 'user'),
    content: coerceContent(m.content),
  }));
}

function openAiEnvelope(content: string): Record<string, unknown> {
  return {
    choices: [{ message: { role: 'assistant', content } }],
    object: 'chat.completion',
  };
}

function anthropicRawToEnvelope(raw: unknown): unknown {
  const r = raw as { content?: Array<{ text?: string }> };
  let text = '';
  if (Array.isArray(r?.content)) {
    for (const b of r.content) {
      if (typeof b?.text === 'string') text += b.text;
    }
  }
  return openAiEnvelope(text);
}

function geminiRawToEnvelope(raw: unknown): unknown {
  const r = raw as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  let text = '';
  const parts = r?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    for (const p of parts) {
      if (typeof p?.text === 'string') text += p.text;
    }
  }
  return openAiEnvelope(text);
}

// ─── OpenAI-compatible (OpenAI + Perplexity) ───────────────────────────────

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

async function openAiCompatibleCompletion(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  stream: boolean,
  extra: Record<string, unknown>
) {
  const rest = extra;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      ...rest,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(text || `${res.status}`), { statusCode: res.status });
  }

  if (!stream) {
    return await res.json();
  }

  if (!res.body) {
    throw new Error('Streaming response body is empty');
  }

  return openAiSSEToAsyncIterable(res.body);
}

async function* openAiSSEToAsyncIterable(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          yield JSON.parse(payload);
        } catch {
          // ignore partial / non-JSON SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Anthropic ───────────────────────────────────────────────────────────────

function toAnthropicBody(messages: ChatMessage[]) {
  let systemParts = '';
  const out: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const m of messages) {
    if (m.role === 'system') {
      systemParts += `${m.content}\n`;
      continue;
    }
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    out.push({ role, content: m.content });
  }
  return {
    system: systemParts.trim() || undefined,
    messages: out,
  };
}

async function anthropicCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  stream: boolean,
  extra: Record<string, unknown>
) {
  const rest = extra;

  const { system, messages: msgs } = toAnthropicBody(messages);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens:
        typeof rest.max_tokens === 'number'
          ? rest.max_tokens
          : typeof (rest as any).max_output_tokens === 'number'
            ? (rest as any).max_output_tokens
            : 4096,
      system,
      messages: msgs,
      stream,
      temperature: typeof rest.temperature === 'number' ? rest.temperature : undefined,
      top_p: typeof rest.top_p === 'number' ? rest.top_p : undefined,
      top_k: typeof rest.top_k === 'number' ? rest.top_k : undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(text || `${res.status}`), { statusCode: res.status });
  }

  if (!stream) {
    return anthropicRawToEnvelope(await res.json());
  }

  if (!res.body) throw new Error('Anthropic streaming body is empty');
  return anthropicSSEToAsyncIterable(res.body);
}

async function* anthropicSSEToAsyncIterable(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const chunks = buffer.split('\n\n');
      buffer = chunks.pop() || '';

      for (const chunk of chunks) {
        let dataStr = '';
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data:')) dataStr += line.slice(5).trim();
        }
        if (!dataStr) continue;
        try {
          const ev = JSON.parse(dataStr);
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
            yield {
              choices: [{ delta: { content: ev.delta.text as string } }],
            };
          }
        } catch {
          // skip malformed event
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Gemini (Generative Language API, OpenAI-ish stream chunks) ──────────────

function normalizeGeminiModel(model: string): string {
  return model.replace(/^gemini\//i, '').replace(/^models\//i, '').trim();
}

function openAiMsgsToGemini(messages: ChatMessage[]) {
  let systemPrompt = '';
  const contents: Array<{ role: string; parts: { text: string }[] }> = [];

  for (const m of messages) {
    if (m.role === 'system') {
      systemPrompt += `${m.content}\n`;
      continue;
    }
    const gemRole = m.role === 'assistant' ? 'model' : 'user';
    contents.push({ role: gemRole, parts: [{ text: m.content }] });
  }

  return {
    systemInstruction:
      systemPrompt.trim().length > 0
        ? { parts: [{ text: systemPrompt.trim() }] }
        : undefined,
    contents,
  };
}

async function geminiCompletion(
  apiKey: string,
  modelRaw: string,
  messages: ChatMessage[],
  stream: boolean,
  extra: Record<string, unknown>
) {
  const rest = extra;

  const model = normalizeGeminiModel(modelRaw);
  const base = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}`;

  const { systemInstruction, contents } = openAiMsgsToGemini(messages);
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      ...(typeof rest.temperature === 'number' ? { temperature: rest.temperature } : {}),
      ...(typeof rest.top_p === 'number' ? { topP: rest.top_p } : {}),
      ...(typeof rest.max_tokens === 'number' ? { maxOutputTokens: rest.max_tokens } : {}),
    },
  };
  if (systemInstruction) body.systemInstruction = systemInstruction;

  const qp = stream
    ? `streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`
    : `generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(`${base}:${qp}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(text || `${res.status}`), { statusCode: res.status });
  }

  if (!stream) return geminiRawToEnvelope(await res.json());

  if (!res.body) throw new Error('Gemini streaming body is empty');
  return geminiSSEToAsyncIterable(res.body);
}

async function* geminiSSEToAsyncIterable(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        try {
          const obj = JSON.parse(payload);
          const parts = obj.candidates?.[0]?.content?.parts;
          let textDelta = '';
          if (Array.isArray(parts)) {
            for (const p of parts) {
              if (typeof p?.text === 'string') textDelta += p.text;
            }
          }
          if (textDelta) {
            yield { choices: [{ delta: { content: textDelta } }] };
          }
        } catch {
          // skip malformed line
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function completion(
  opts: CompletionArgs & Record<string, unknown>
): Promise<unknown | AsyncGenerator<unknown, void>> {
  const { provider, model, messages, stream, api_key } = opts;
  const stripped: Record<string, unknown> = { ...opts };
  delete stripped.provider;
  delete stripped.model;
  delete stripped.messages;
  delete stripped.stream;
  delete stripped.api_key;

  switch (provider) {
    case 'OPEN_AI':
      return openAiCompatibleCompletion(
        OPENAI_URL,
        api_key,
        model,
        messages,
        stream,
        stripped
      );
    case 'PERPLEXITY':
      return openAiCompatibleCompletion(
        PERPLEXITY_URL,
        api_key,
        model,
        messages,
        stream,
        stripped
      );
    case 'ANTHROPIC':
      return anthropicCompletion(api_key, model, messages, stream, stripped);
    case 'GEMINI':
      return geminiCompletion(api_key, model, messages, stream, stripped);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
