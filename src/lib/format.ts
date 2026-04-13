export function formatNaira(n: number, fractionDigits = 0): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
}

export function formatDate(isoOrDisplay: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDisplay)) {
    const [y, m, d] = isoOrDisplay.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  }
  return isoOrDisplay;
}

export function truncateMiddle(s: string, left = 6, right = 4): string {
  if (s.length <= left + right + 1) return s;
  return `${s.slice(0, left)}…${s.slice(-right)}`;
}

export function formatPhoneNG(digits: string): string {
  const d = digits.replace(/\D/g, '');
  const rest = d.startsWith('234') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d;
  if (rest.length !== 10) return digits;
  return `+234 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
}

export function formatNumberInput(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n.replace(/,/g, '')) || 0 : n;
  return num.toLocaleString('en-NG');
}
