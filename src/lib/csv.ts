/** Download CSV with RFC-style field quoting. */

export function rowsToCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map(row =>
      row.map(cell => {
        const s = cell === null || cell === undefined ? '' : String(cell);
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }).join(',')
    )
    .join('\n');
}

export function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]): void {
  const csv = rowsToCsv(rows);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
