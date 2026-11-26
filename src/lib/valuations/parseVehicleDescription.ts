/**
 * Best-effort parse of "MAKE MODEL YEAR VIN PLATE" style descriptions.
 * Never throws; returns only fields it can confidently detect.
 */
export type ParsedVehicleDescription = {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  plate?: string;
  /** Nigerian registration / import class. Not part of the model or plate. */
  registered?: boolean;
  brandNew?: boolean;
  tokunbo?: boolean;
};

const VIN_RE = /\b([A-HJ-NPR-Z0-9]{17})\b/i;
const YEAR_RE = /\b(19\d{2}|20\d{2})\b/;

/** Words that describe the vehicle, not its model or plate. TOKS is short for tokunbo. */
const ORIGIN_WORD: Record<string, 'registered' | 'brandNew' | 'tokunbo'> = {
  TOKS: 'tokunbo',
  TOKUNBO: 'tokunbo',
  TOKUNBOH: 'tokunbo',
  BRANDNEW: 'brandNew',
  'BRAND-NEW': 'brandNew',
  REGISTERED: 'registered',
};

function takeOrigin(tokens: string[]): { tokens: string[]; origin: Pick<ParsedVehicleDescription, 'registered' | 'brandNew' | 'tokunbo'> } {
  const origin: Pick<ParsedVehicleDescription, 'registered' | 'brandNew' | 'tokunbo'> = {};
  const kept: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i]!.toUpperCase();
    const next = tokens[i + 1]?.toUpperCase();
    if (word === 'BRAND' && next === 'NEW') {
      origin.brandNew = true;
      origin.tokunbo = false;
      i += 1;
      continue;
    }
    const kind = ORIGIN_WORD[word];
    if (kind === 'tokunbo') {
      origin.tokunbo = true;
      origin.brandNew = false;
      continue;
    }
    if (kind === 'brandNew') {
      origin.brandNew = true;
      origin.tokunbo = false;
      continue;
    }
    if (kind === 'registered') {
      origin.registered = true;
      continue;
    }
    kept.push(tokens[i]!);
  }
  return { tokens: kept, origin };
}

export function parseVehicleDescription(raw: string): ParsedVehicleDescription {
  const text = (raw || '').trim().replace(/\s+/g, ' ');
  if (!text) return {};

  const out: ParsedVehicleDescription = {};
  const vinMatch = text.match(VIN_RE);
  if (vinMatch?.[1]) out.vin = vinMatch[1].toUpperCase();

  const yearMatch = text.match(YEAR_RE);
  if (yearMatch?.[1]) out.year = Number(yearMatch[1]);

  // Strip VIN/year for tokenizing make/model/plate
  let rest = text;
  if (out.vin) rest = rest.replace(new RegExp(out.vin, 'i'), ' ');
  if (out.year) rest = rest.replace(String(out.year), ' ');
  rest = rest.replace(/\s+/g, ' ').trim();

  const split = takeOrigin(rest.split(' ').filter(Boolean));
  if (split.origin.registered) out.registered = true;
  if (split.origin.brandNew) out.brandNew = true;
  if (split.origin.tokunbo) out.tokunbo = true;

  const tokens = split.tokens;
  if (tokens.length >= 1) out.make = tokens[0]!.toUpperCase();
  if (tokens.length >= 2) {
    // Last token after make/model often plate when VIN already extracted
    const maybePlate = tokens[tokens.length - 1]!;
    const looksLikePlate = /^[A-Z0-9-]{5,12}$/i.test(maybePlate) && !/^\d+$/.test(maybePlate);
    if (looksLikePlate && tokens.length >= 3) {
      out.plate = maybePlate.toUpperCase();
      out.model = tokens.slice(1, -1).join(' ').toUpperCase();
    } else {
      out.model = tokens.slice(1).join(' ').toUpperCase();
    }
  }

  return out;
}

/** Fill empty linkage fields from a description parse without overwriting user input. */
export function mergeParsedIntoForm<T extends Record<string, unknown>>(
  form: T,
  parsed: ParsedVehicleDescription
): T {
  const next = { ...form };
  const assign = (key: keyof ParsedVehicleDescription, formKey: string) => {
    const v = parsed[key];
    if (v == null || v === '') return;
    const cur = next[formKey];
    if (cur == null || cur === '' || cur === 0) {
      (next as Record<string, unknown>)[formKey] = v;
    }
  };
  assign('make', 'make');
  if (parsed.model) {
    const currentModel = String(next.model ?? '');
    if (!currentModel.trim() || /\b(TOKS|TOKUNBOH?|BRAND[-\s]?NEW|REGISTERED)\b/i.test(currentModel)) {
      (next as Record<string, unknown>).model = parsed.model;
    }
  }
  assign('year', 'year');
  assign('vin', 'vin');
  assign('plate', 'plate');
  if (parsed.tokunbo) {
    (next as Record<string, unknown>).tokunbo = true;
    (next as Record<string, unknown>).brandNew = false;
  }
  if (parsed.brandNew) {
    (next as Record<string, unknown>).brandNew = true;
    (next as Record<string, unknown>).tokunbo = false;
  }
  if (parsed.registered) {
    (next as Record<string, unknown>).registered = true;
  }
  return next;
}
