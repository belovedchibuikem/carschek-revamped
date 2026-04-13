'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Camera, X, Mic, Check, Edit, Play, RotateCcw, Zap, ArrowRight, CheckCircle, RefreshCw, Send, Loader } from 'lucide-react';
import { useChat } from '@/lib/hooks/useChat';
import toast, { Toaster } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type CameraStep = 'idle' | 'capture' | 'analyzing' | 'results';
type VoiceStep = 'ready' | 'recording' | 'transcribing' | 'result' | 'error';
type DemoStep = 'idle' | 'camera' | 'analyzing' | 'ai-result' | 'voice-ready' | 'voice-recording' | 'voice-transcribing' | 'voice-result' | 'submitted';

// ─── AI Defect Detection Component ───────────────────────────────────────────
function AIDefectDetection() {
  const [step, setStep] = useState<CameraStep>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiResult, setAiResult] = useState<{ severity: string; description: string; confidence: number } | null>(null);
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', false);

  useEffect(() => {
    if (error) toast.error('AI analysis failed: ' + error.message);
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && step === 'analyzing') {
      try {
        const parsed = JSON.parse(response);
        setAiResult(parsed);
      } catch {
        setAiResult({ severity: 'Minor', description: response, confidence: 80 });
      }
      setStep('results');
    }
  }, [response, isLoading, step]);

  const startCapture = () => setStep('capture');

  const capturePhoto = () => {
    setStep('analyzing');
    setAnalysisProgress(0);
    const timings = [{ d: 600, p: 35 }, { d: 1400, p: 70 }, { d: 2200, p: 100 }];
    timings.forEach(t => setTimeout(() => setAnalysisProgress(t.p), t.d));

    sendMessage([
      { role: 'system', content: 'You are a vehicle damage detection AI. Respond ONLY with valid JSON, no markdown.' },
      {
        role: 'user',
        content: `Analyze a photo of a vehicle front bumper for defects. 
        Provide a realistic assessment as JSON: 
        {"severity": "Major", "description": "Crack on front bumper right side approximately 10cm", "confidence": 87}`
      }
    ], { temperature: 0.3, max_tokens: 150 });
  };

  const reset = () => {
    setStep('idle');
    setAnalysisProgress(0);
    setAiResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#1F2937]">Feature 1 — AI Defect Detection</h2>
              <span className="flex items-center gap-1 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Zap size={9} /> Gemini
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">Camera capture → Gemini AI analysis → Results with severity</p>
          </div>
          {step !== 'idle' && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1F2937]">
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex justify-center">
        <div className="w-72 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-black rounded-[2rem] overflow-hidden relative" style={{ height: 520 }}>
            {step === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center bg-[#1F2937] p-6 text-center">
                <div className="w-16 h-16 bg-[#2E75B6]/20 rounded-2xl flex items-center justify-center mb-4">
                  <Camera size={32} className="text-[#2E75B6]" />
                </div>
                <p className="text-white font-semibold mb-2">Front Bumper</p>
                <p className="text-white/50 text-xs mb-6">Tap to capture and analyse with Gemini AI</p>
                <button onClick={startCapture} className="flex items-center gap-2 px-5 py-2.5 bg-[#2E75B6] text-white text-sm font-medium rounded-xl">
                  <Camera size={16} /> Open Camera
                </button>
              </div>
            )}

            {step === 'capture' && (
              <div className="h-full flex flex-col bg-black relative">
                <button onClick={reset} className="absolute top-4 left-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={16} className="text-white" />
                </button>
                <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-dashed border-white/70 rounded-xl w-52 h-36 flex items-end justify-center pb-2">
                      <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position the part within the frame</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center py-6 bg-black">
                  <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
              </div>
            )}

            {step === 'analyzing' && (
              <div className="h-full flex flex-col bg-black">
                <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 relative">
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
                      <Zap size={20} className="text-[#2E75B6] absolute inset-0 m-auto" />
                    </div>
                    <p className="text-white text-sm font-semibold">Gemini AI is analysing...</p>
                    <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
                    </div>
                    <p className="text-white/60 text-xs">
                      {analysisProgress < 35 ? 'Detecting defects...' : analysisProgress < 70 ? 'Classifying severity...' : 'Done ✓'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 'results' && aiResult && (
              <div className="h-full flex flex-col bg-black">
                <div className="relative flex-shrink-0" style={{ height: 200 }}>
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
                      <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                        {aiResult.severity} defect detected
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 bg-white overflow-y-auto">
                  <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center gap-2">
                    <Zap size={15} className="text-[#2E75B6]" />
                    <span className="text-sm font-bold text-[#1F2937]">Gemini AI: 1 defect detected</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-[#C0392B] bg-red-100 px-2 py-0.5 rounded-full">{aiResult.severity}</span>
                        <span className="text-[10px] text-[#6B7280]">{aiResult.confidence}% confidence</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{aiResult.description}</p>
                    </div>
                    <div className="space-y-2">
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl">
                        <Check size={14} /> Apply AI Result
                      </button>
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2E75B6] text-white text-xs font-semibold rounded-xl">
                        <Edit size={14} /> Edit Before Applying
                      </button>
                      <button onClick={reset} className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E5E7EB] text-[#6B7280] text-xs font-medium rounded-xl">
                        <X size={14} /> AI is Wrong — Enter Manually
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Voice Note Component ─────────────────────────────────────────────────────
function VoiceNoteInput() {
  const [voiceStep, setVoiceStep] = useState<VoiceStep>('ready');
  const [timer, setTimer] = useState(0);
  const [bars, setBars] = useState([3, 5, 2, 7, 4, 6, 3, 5, 2, 4]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [transcription, setTranscription] = useState('');
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', false);

  useEffect(() => {
    if (error) toast.error('Transcription failed');
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && voiceStep === 'transcribing') {
      setTranscription(response);
      setVoiceStep('result');
    }
  }, [response, isLoading, voiceStep]);

  const startRecording = () => {
    setVoiceStep('recording');
    setTimer(0);
    intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    barIntervalRef.current = setInterval(() => {
      setBars(Array.from({ length: 10 }, () => Math.floor(Math.random() * 8) + 1));
    }, 150);
  };

  const stopRecording = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (barIntervalRef.current) clearInterval(barIntervalRef.current);
    setVoiceStep('transcribing');

    sendMessage([
      { role: 'system', content: 'You are a vehicle inspection transcription AI. Convert the inspector\'s voice note into a clear, professional defect description. Return only the transcribed text, no extra formatting.' },
      { role: 'user', content: 'Inspector voice note (simulated): "There is a crack on the front bumper, right side, about ten centimeters long, looks like impact damage"' }
    ], { temperature: 0.3, max_tokens: 100 });
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (barIntervalRef.current) clearInterval(barIntervalRef.current);
    setVoiceStep('ready');
    setTimer(0);
    setTranscription('');
  };

  const fmt = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#1F2937]">Feature 2 — Voice Note + AI Transcription</h2>
              <span className="flex items-center gap-1 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Zap size={9} /> Gemini
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">Hold to record → Gemini AI transcribes → Apply to defect note</p>
          </div>
          {voiceStep !== 'ready' && (
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1F2937]">
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex justify-center">
        <div className="w-72 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: 520 }}>
            <div className="h-full flex flex-col p-5">
              <div className="mb-4">
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">Defect Note</p>
                <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] min-h-[80px]">
                  {voiceStep === 'result' ? (
                    <p className="text-xs text-[#1F2937] leading-relaxed">{transcription}</p>
                  ) : (
                    <p className="text-xs text-[#9CA3AF] italic">Voice note will appear here after recording...</p>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                {voiceStep === 'ready' && (
                  <>
                    <button onMouseDown={startRecording} onTouchStart={startRecording}
                      className="w-20 h-20 rounded-full bg-[#1E3A5F] flex items-center justify-center shadow-lg hover:bg-[#2E75B6] transition-colors active:scale-95">
                      <Mic size={32} className="text-white" />
                    </button>
                    <p className="text-xs text-[#6B7280] text-center">Hold to record voice note<br />Release to stop</p>
                  </>
                )}

                {voiceStep === 'recording' && (
                  <>
                    <button onMouseUp={stopRecording} onTouchEnd={stopRecording}
                      className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
                      <Mic size={32} className="text-white" />
                    </button>
                    <div className="flex items-center gap-0.5 h-8">
                      {bars.map((h, i) => (
                        <div key={i} className="w-1.5 bg-red-400 rounded-full transition-all duration-100" style={{ height: `${h * 4}px` }} />
                      ))}
                    </div>
                    <p className="text-xs font-mono text-red-600 font-semibold">{fmt(timer)} recording...</p>
                    <button onClick={stopRecording} className="text-xs text-[#6B7280] underline">Stop Recording</button>
                  </>
                )}

                {voiceStep === 'transcribing' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#2E75B6]/10 flex items-center justify-center">
                      <Loader size={28} className="text-[#2E75B6] animate-spin" />
                    </div>
                    <p className="text-sm text-[#2E75B6] font-medium">Gemini AI transcribing...</p>
                  </>
                )}

                {voiceStep === 'result' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle size={32} className="text-[#1A7A4A]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1A7A4A]">Transcribed!</p>
                    <div className="flex gap-2 w-full">
                      <button onClick={reset} className="flex-1 py-2.5 border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#6B7280]">
                        Re-record
                      </button>
                      <button onClick={() => { toast.success('Voice note applied!'); reset(); }}
                        className="flex-1 py-2.5 bg-[#1E3A5F] text-white rounded-xl text-xs font-bold">
                        Apply Note
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Chat Assistant ────────────────────────────────────────────────────────
function AIInspectionChat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Hi! I\'m your Carschek AI inspection assistant powered by Gemini. Ask me anything about vehicle inspection, defect identification, or report writing.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { response, isLoading, error, sendMessage } = useChat('GEMINI', 'gemini/gemini-2.5-flash', true);
  const [lastResponse, setLastResponse] = useState('');

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (response && !isLoading && response !== lastResponse) {
      setLastResponse(response);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.content === '...') {
          return [...prev.slice(0, -1), { role: 'assistant', content: response }];
        }
        return prev;
      });
    }
  }, [response, isLoading, lastResponse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: '...' }]);

    const history = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    sendMessage([
      {
        role: 'system',
        content: `You are a Carschek automotive inspection AI assistant for Nigerian vehicle inspectors. 
        Help with: inspection techniques, defect identification, severity assessment, report writing, vehicle-specific knowledge.
        Be concise, practical, and professional. Use Nigerian automotive context where relevant.`
      },
      ...history.filter(m => m.content !== '...'),
      { role: 'user', content: userMsg }
    ], { temperature: 0.7, max_tokens: 400 });
  };

  const quickPrompts = [
    'How do I identify frame damage?',
    'What makes a defect Critical vs Major?',
    'How to check engine oil quality?',
    'Signs of flood damage in a car?',
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2E75B6] to-[#1E3A5F] rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1F2937]">Feature 3 — AI Inspection Assistant</h2>
              <span className="flex items-center gap-1 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Zap size={9} /> Gemini Live
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">Real-time AI guidance powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {quickPrompts.map(p => (
            <button key={p} onClick={() => { setInput(p); }}
              className="px-3 py-1.5 bg-[#EFF6FF] text-[#1E3A5F] rounded-full text-xs font-medium hover:bg-[#DBEAFE] transition-colors">
              {p}
            </button>
          ))}
        </div>

        <div className="bg-[#F9FAFB] rounded-2xl p-4 space-y-3 mb-4 overflow-y-auto" style={{ height: 300 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ?'bg-[#1E3A5F] text-white rounded-br-sm' :'bg-white border border-[#E5E7EB] text-[#1F2937] rounded-bl-sm shadow-sm'
              }`}>
                {msg.content === '...' && isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about inspection techniques, defects, reports..."
            className="flex-1 bg-[#F4F6F8] border border-[#E5E7EB] rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-[#1E3A5F] rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#2E75B6] transition-colors">
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Combined Demo Flow ───────────────────────────────────────────────────────
function CombinedDemoFlow() {
  const [demoStep, setDemoStep] = useState<DemoStep>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [waveBars, setWaveBars] = useState([3, 5, 2, 7, 4, 6, 3, 5, 2, 4]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDemo = () => {
    setDemoStep('camera');
  };

  const captureInDemo = () => {
    setDemoStep('analyzing');
    setAnalysisProgress(0);
    const timings = [{ d: 600, p: 35 }, { d: 1400, p: 70 }, { d: 2200, p: 100 }];
    timings.forEach(t => setTimeout(() => setAnalysisProgress(t.p), t.d));
    setTimeout(() => setDemoStep('ai-result'), 2800);
  };

  const applyAI = () => setDemoStep('voice-ready');

  const startVoice = () => {
    setDemoStep('voice-recording');
    setVoiceTimer(0);
    timerRef.current = setInterval(() => setVoiceTimer(t => t + 1), 1000);
    waveRef.current = setInterval(() => {
      setWaveBars(Array.from({ length: 10 }, () => Math.floor(Math.random() * 8) + 1));
    }, 150);
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveRef.current) clearInterval(waveRef.current);
      setDemoStep('voice-transcribing');
      setTimeout(() => setDemoStep('voice-result'), 2000);
    }, 4000);
  };

  const submitDefect = () => setDemoStep('submitted');

  const resetDemo = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveRef.current) clearInterval(waveRef.current);
    setDemoStep('idle');
    setVoiceTimer(0);
    setAnalysisProgress(0);
  };

  const STEPS = [
    { key: 'camera', label: 'Capture Photo' },
    { key: 'analyzing', label: 'AI Analysis' },
    { key: 'ai-result', label: 'AI Results' },
    { key: 'voice-ready', label: 'Voice Note' },
    { key: 'voice-result', label: 'Transcribed' },
    { key: 'submitted', label: 'Submitted' },
  ];

  const currentStepIdx = STEPS.findIndex(s => demoStep.startsWith(s.key.split('-')[0]) || demoStep === s.key);

  return (
    <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2E75B6] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Combined Demo Flow</h2>
            <p className="text-xs text-white/60 mt-0.5">Complete inspector flow: Photo → Gemini AI Detection → Voice Note → Submit</p>
          </div>
          {demoStep !== 'idle' && (
            <button onClick={resetDemo} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
        {demoStep !== 'idle' && (
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const isActive = demoStep.includes(s.key) || (s.key === 'camera' && demoStep === 'camera');
              const isDone = currentStepIdx > i;
              return (
                <React.Fragment key={s.key}>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                    isDone ? 'bg-white/20 text-white' : isActive ? 'bg-white text-[#1E3A5F]' : 'bg-white/10 text-white/40'
                  }`}>
                    {isDone && <Check size={10} />}
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <ArrowRight size={12} className="text-white/30 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-6 flex justify-center">
        {demoStep === 'idle' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play size={36} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Start the Demo</h3>
            <p className="text-white/60 text-sm mb-6 max-w-xs">Watch a complete inspector flow from photo capture to defect submission with Gemini AI.</p>
            <button onClick={runDemo} className="px-6 py-3 bg-white text-[#1E3A5F] font-semibold rounded-xl hover:bg-white/90 transition-colors">
              Begin Demo
            </button>
          </div>
        )}

        {demoStep !== 'idle' && (
          <div className="w-72 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
            <div className="bg-black rounded-[2rem] overflow-hidden" style={{ height: 520 }}>
              {demoStep === 'camera' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="flex-1 relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center">
                    <div className="border-2 border-dashed border-white/70 rounded-xl w-52 h-36 flex items-end justify-center pb-2">
                      <span className="text-white text-[10px] bg-black/50 px-2 py-0.5 rounded-full">Position the part within the frame</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-6 bg-black">
                    <button onClick={captureInDemo} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              )}

              {demoStep === 'analyzing' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 relative">
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-[#2E75B6]/30 border-t-[#2E75B6] animate-spin" />
                        <Zap size={20} className="text-[#2E75B6] absolute inset-0 m-auto" />
                      </div>
                      <p className="text-white text-sm font-semibold text-center px-4">Gemini AI is analysing...</p>
                      <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2E75B6] rounded-full transition-all duration-500" style={{ width: `${analysisProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {demoStep === 'ai-result' && (
                <div className="h-full flex flex-col bg-black">
                  <div className="relative flex-shrink-0" style={{ height: 180 }}>
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-red-500 rounded-lg w-28 h-16 relative">
                        <div className="absolute -top-5 left-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">AI: Crack detected</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white overflow-y-auto">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-[#2E75B6]" />
                        <span className="text-xs font-bold text-[#1F2937]">Gemini AI: 1 defect detected</span>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <p className="text-[10px] font-semibold text-[#C0392B]">Crack / surface damage</p>
                        <p className="text-[10px] text-[#6B7280] mt-1">87% confidence · Suggested: Major</p>
                      </div>
                      <button onClick={applyAI} className="w-full py-2.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-xl">
                        ✓ Apply & Add Voice Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {demoStep === 'voice-ready' && (
                <div className="h-full bg-white flex flex-col p-5">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Add Voice Note</p>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 mb-4 border border-[#E5E7EB]">
                    <p className="text-xs text-[#374151] italic">"Crack on front bumper, right side ~10cm"</p>
                    <p className="text-[10px] text-[#6B7280] mt-1">AI pre-filled · tap mic to add more detail</p>
                  </div>
                  <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                    <button onClick={startVoice} className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-all">
                      <Mic size={24} className="text-[#6B7280]" />
                    </button>
                    <p className="text-xs text-[#6B7280]">Hold to record voice note</p>
                  </div>
                </div>
              )}

              {demoStep === 'voice-recording' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-5 gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
                    <Mic size={24} className="text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 h-8">
                    {waveBars.map((h, i) => (
                      <div key={i} className="w-1.5 bg-red-400 rounded-full transition-all duration-100" style={{ height: `${h * 4}px` }} />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-red-600 font-semibold">0:{voiceTimer.toString().padStart(2, '0')} recording...</p>
                </div>
              )}

              {demoStep === 'voice-transcribing' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-5 gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#2E75B6]/10 flex items-center justify-center">
                    <RefreshCw size={24} className="text-[#2E75B6] animate-spin" />
                  </div>
                  <p className="text-sm text-[#2E75B6] font-medium">Gemini AI transcribing...</p>
                </div>
              )}

              {demoStep === 'voice-result' && (
                <div className="h-full bg-white flex flex-col p-5">
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Defect Note</p>
                  <div className="bg-[#F9FAFB] rounded-xl p-3 mb-3 border border-[#E5E7EB] flex-1">
                    <p className="text-xs text-[#1F2937] leading-relaxed">There is a crack on the front bumper approximately 10cm long on the right side — impact damage visible</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 border border-green-100 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-[#1A7A4A]" />
                      <span className="text-[10px] font-semibold text-[#1A7A4A]">Transcribed with high confidence</span>
                    </div>
                  </div>
                  <button onClick={submitDefect} className="w-full py-3 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl">
                    Submit Defect
                  </button>
                </div>
              )}

              {demoStep === 'submitted' && (
                <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-[#1A7A4A]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2937] mb-2">Defect Submitted!</h3>
                  <p className="text-xs text-[#6B7280] mb-6">Gemini AI detection + voice note saved to inspection report.</p>
                  <button onClick={resetDemo} className="px-5 py-2.5 bg-[#1E3A5F] text-white text-sm font-medium rounded-xl">
                    Run Demo Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIInspectorToolsPage() {
  return (
    <AppLayout currentPath="/ai-inspector-tools">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontSize: '13px', fontWeight: '600', borderRadius: '12px' } }} />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#1F2937]">AI Inspector Tools</h1>
          <span className="flex items-center gap-1.5 bg-gradient-to-r from-[#1E3A5F] to-[#2E75B6] text-white text-xs font-bold px-3 py-1 rounded-full">
            <Zap size={12} /> Powered by Gemini
          </span>
        </div>
        <p className="text-sm text-[#6B7280]">AI Defect Detection · Voice Transcription · Inspection Assistant — all powered by Google Gemini 2.5 Flash</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AIDefectDetection />
        <VoiceNoteInput />
      </div>

      <div className="mb-6">
        <AIInspectionChat />
      </div>

      <CombinedDemoFlow />
    </AppLayout>
  );
}
