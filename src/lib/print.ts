/** Browser print / “Save as PDF” helper — no server PDF until API exists. */

export function openPrintableReport(options: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
}): void {
  const w = window.open('', '_blank');
  if (!w) return;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(options.title)}</title>
<style>
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #1F2937; max-width: 800px; margin: 0 auto; }
  h1 { color: #1E3A5F; font-size: 22px; margin: 0 0 4px; }
  .sub { color: #6B7280; font-size: 13px; margin-bottom: 20px; }
  .meta { color: #9CA3AF; font-size: 11px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th, td { border: 1px solid #E5E7EB; padding: 8px 10px; text-align: left; }
  th { background: #F4F6F8; color: #374151; }
  @page { margin: 16mm; }
</style></head><body>
  <h1>${escapeHtml(options.title)}</h1>
  ${options.subtitle ? `<p class="sub">${escapeHtml(options.subtitle)}</p>` : ''}
  <p class="meta">Carschek · ${new Date().toLocaleString('en-NG')}</p>
  ${options.bodyHtml}
  <p style="margin-top:32px;font-size:11px;color:#9CA3AF;">Use your browser Print dialog (Ctrl+P) to save as PDF.</p>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
