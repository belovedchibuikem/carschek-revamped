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
};

const VIN_RE = /\b([A-HJ-NPR-Z0-9]{17})\b/i;
const YEAR_RE = /\b(19\d{2}|20\d{2})\b/;

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

  const tokens = rest.split(' ').filter(Boolean);
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
  assign('model', 'model');
  assign('year', 'year');
  assign('vin', 'vin');
  assign('plate', 'plate');
  return next;
}
