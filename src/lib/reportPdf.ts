import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Smart multi-page PDF capture (html2canvas + jsPDF).
 *
 * Instead of slicing the rasterized page at fixed A4 intervals (which cuts
 * text lines and photos in half), page breaks are chosen by an algorithm:
 *
 *  1. DOM pass — every "atomic" element (images, table rows, headings, text
 *     leaves, `.pdf-avoid-break` / `[data-pdf-atomic]`) contributes a
 *     no-cut band. A break may not land inside any band.
 *  2. Pixel pass — within the allowed zone, the cut is placed on a visually
 *     blank canvas row (uniform colour), so the break always falls in
 *     whitespace between blocks.
 *  3. If the ideal line sits inside an atomic block, the break moves to just
 *     before that block so the whole block starts on the next page.
 *  4. A hard cut is used only when a single block is taller than the page
 *     and no blank row exists inside it. Images are capped to one page
 *     before capture so they are scaled, not sliced.
 *
 * Slices are drawn at their true proportional height (never stretched), so
 * the last page keeps its aspect ratio.
 */

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
/** A4 width in CSS px at 96dpi — the layout width every PDF is typeset at. */
const A4_LAYOUT_PX = 794;
const PRINT_HOST_ID = '__pdf-print-host';

/** How far above the ideal line we search for a clean break (almost a full page). */
const LOOKBACK_RATIO = 0.92;
/** Max per-channel deviation for a canvas row to count as "blank". */
const UNIFORM_TOLERANCE = 16;

export type CapturePdfOptions = {
  /** Page margin in mm applied to all sides. Default 6. */
  marginMm?: number;
  /** html2canvas render scale. Default 2. */
  scale?: number;
  /** Layout width (CSS px) the print clone is typeset at. Default 794 (A4 @96dpi). */
  windowWidth?: number;
  /**
   * Progress callback. Phases:
   *  - ('capture', 0, 0)        — html2canvas rasterization started
   *  - ('page', n, total)       — page n of total rendered into the PDF
   */
  onProgress?: (phase: 'capture' | 'page', page: number, total: number) => void;
};

type Band = [start: number, end: number];

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      img =>
        new Promise<void>(resolve => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );
}

function mergeBands(bands: Band[]): Band[] {
  if (bands.length === 0) return [];
  const sorted = [...bands].sort((a, b) => a[0] - b[0]);
  const out: Band[] = [[sorted[0][0], sorted[0][1]]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    // Only fuse real overlaps. Rows that merely touch must stay separate so
    // the break can sit on the edge between them instead of slicing a row.
    if (cur[0] < last[1] - 0.5) last[1] = Math.max(last[1], cur[1]);
    else out.push([cur[0], cur[1]]);
  }
  return out;
}

/**
 * Collects vertical bands (in canvas px, relative to the element top) that a
 * page break must not intersect.
 */
function collectNoCutBands(root: HTMLElement, domScale: number, pageHeightPx: number): Band[] {
  const rootTop = root.getBoundingClientRect().top;
  const bands: Band[] = [];

  const add = (el: Element, padTopCss = 0, padBottomCss = 0) => {
    const r = el.getBoundingClientRect();
    if (r.height <= 0 || r.width <= 0) return;
    const hPx = r.height * domScale;
    // An element taller than ~90% of a page cannot be kept whole — skip it so
    // the pixel pass can still find a blank row inside it.
    if (hPx >= pageHeightPx * 0.9) return;
    bands.push([
      (r.top - rootTop - padTopCss) * domScale,
      (r.bottom - rootTop + padBottomCss) * domScale,
    ]);
  };

  for (const el of Array.from(root.querySelectorAll('*'))) {
    const tag = el.tagName.toUpperCase();
    if (/^H[1-6]$/.test(tag)) {
      // Keep headings glued to the content below them (no orphan titles).
      add(el, 0, 12);
      continue;
    }
    if (/^(IMG|SVG|CANVAS|TR|TH|TD|LI|P|FIGURE|FIGCAPTION|BLOCKQUOTE|BUTTON|TABLE)$/.test(tag)) {
      add(el);
      continue;
    }
    const htmlEl = el as HTMLElement;
    if (
      el.classList.contains('pdf-avoid-break') ||
      el.classList.contains('photo-tile') ||
      htmlEl.dataset?.pdfAtomic !== undefined
    ) {
      add(el);
      continue;
    }
    // Leaf blocks (no element children) are text lines / paragraphs / values.
    if (el.childElementCount === 0) add(el);
  }

  return mergeBands(bands);
}

/** Binary search: is y inside any no-cut band? */
function insideBand(bands: Band[], y: number): boolean {
  let lo = 0;
  let hi = bands.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [s, e] = bands[mid];
    if (y <= s) hi = mid - 1;
    else if (y >= e) lo = mid + 1;
    else return true;
  }
  return false;
}

/** True when the canvas row at `y` is a single (near-)uniform colour. */
function isUniformRow(data: Uint8ClampedArray, width: number, rowIdx: number): boolean {
  const base = rowIdx * width * 4;
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  const step = 4 * 4; // sample every 4th pixel
  for (let i = base; i < base + width * 4; i += step) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (g < minG) minG = g;
    if (g > maxG) maxG = g;
    if (b < minB) minB = b;
    if (b > maxB) maxB = b;
    if (maxR - minR > UNIFORM_TOLERANCE || maxG - minG > UNIFORM_TOLERANCE || maxB - minB > UNIFORM_TOLERANCE) {
      return false;
    }
  }
  return true;
}

/**
 * Computes the y positions (canvas px) where each page ends.
 * Always returns at least one entry, ending exactly at canvas height.
 */
function computeCutPoints(canvas: HTMLCanvasElement, bands: Band[], pageHeightPx: number): number[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const totalH = canvas.height;
  const lookback = Math.floor(pageHeightPx * LOOKBACK_RATIO);
  const cuts: number[] = [];
  let current = 0;

  while (current < totalH) {
    const ideal = current + pageHeightPx;
    if (ideal >= totalH) {
      cuts.push(totalH);
      break;
    }

    const windowTop = Math.max(current + 1, Math.floor(ideal) - lookback);
    const windowH = Math.floor(ideal) - windowTop;

    let chosen = -1;

    if (ctx && windowH > 0) {
      const img = ctx.getImageData(0, windowTop, canvas.width, windowH);
      // Pass 1: blank row outside every no-cut band, scanning up from ideal.
      for (let y = Math.floor(ideal) - 1; y >= windowTop; y--) {
        if (insideBand(bands, y)) continue;
        if (isUniformRow(img.data, canvas.width, y - windowTop)) {
          chosen = y;
          break;
        }
      }
    }

    // Pass 2: any row outside the no-cut bands.
    if (chosen < 0) {
      for (let y = Math.floor(ideal); y > windowTop; y--) {
        if (!insideBand(bands, y)) {
          chosen = y;
          break;
        }
      }
    }

    // Pass 3: the ideal line is inside a block that still fits on the next page.
    // End this page at the top of that block.
    if (chosen < 0) {
      for (let i = bands.length - 1; i >= 0; i--) {
        const [start, end] = bands[i];
        if (ideal > start && ideal < end && start > current + 8 && end - start <= pageHeightPx) {
          chosen = Math.floor(start);
          break;
        }
      }
    }

    // Pass 4: end the page on the bottom edge of the last block that fits.
    if (chosen < 0) {
      let edge = -1;
      for (const [start, end] of bands) {
        if (end <= ideal && end > current + 8) edge = Math.floor(end);
        if (start > ideal) break;
      }
      if (edge > current) chosen = edge;
    }

    // Pass 5: a block taller than the page already started here. Split only on
    // a blank row (the gap between wrapped lines), never through ink.
    if (chosen < 0 && ctx) {
      const from = current + 8;
      const height = Math.floor(ideal) - from;
      if (height > 0) {
        const img = ctx.getImageData(0, from, canvas.width, height);
        for (let y = Math.floor(ideal) - 1; y >= from; y--) {
          if (isUniformRow(img.data, canvas.width, y - from)) {
            chosen = y;
            break;
          }
        }
      }
    }

    if (chosen <= current) chosen = Math.min(totalH, Math.floor(ideal));

    cuts.push(chosen);
    current = chosen;
  }

  if (cuts.length === 0) cuts.push(totalH);
  return cuts;
}

function sliceToDataUrl(source: HTMLCanvasElement, sy: number, sh: number): string {
  const c = document.createElement('canvas');
  c.width = source.width;
  c.height = sh;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(source, 0, sy, source.width, sh, 0, 0, source.width, sh);
  }
  return c.toDataURL('image/jpeg', 0.92);
}

/** Yields to the event loop so progress toasts can paint between pages. */
function nextFrame(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mounts an invisible deep clone of `element` typeset at a fixed print width.
 *
 * The PDF must always be laid out for A4 paper — never a capture of the live
 * (possibly mobile) layout. The clone is `visibility: hidden` so it still
 * participates in layout (no-cut bands can be measured from it) without ever
 * flashing on screen; html2canvas's `onclone` hook flips it visible inside the
 * capture document only.
 */
function mountPrintClone(element: HTMLElement, widthPx: number): { clone: HTMLElement; cleanup: () => void } {
  const host = document.createElement('div');
  host.id = PRINT_HOST_ID;
  host.style.cssText = [
    'position:absolute',
    'top:0',
    'left:0',
    `width:${widthPx}px`,
    'background:#ffffff',
    'visibility:hidden',
    'pointer-events:none',
    'z-index:-1',
  ].join(';');

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${widthPx}px`;
  clone.style.maxWidth = 'none';
  clone.style.margin = '0';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';
  clone.style.overflowWrap = 'anywhere';
  clone.setAttribute('data-pdf-root', '1');

  const fit = document.createElement('style');
  fit.textContent = `
    [data-pdf-root] img {
      max-height: 980px !important;
      max-width: 100% !important;
    }
    [data-pdf-root] p, [data-pdf-root] li, [data-pdf-root] td, [data-pdf-root] th {
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
  `;
  clone.prepend(fit);

  // cloneNode does not copy <canvas> bitmaps — redraw them onto the clone.
  const srcCanvases = element.querySelectorAll('canvas');
  const dstCanvases = clone.querySelectorAll('canvas');
  srcCanvases.forEach((src, i) => {
    const dst = dstCanvases[i];
    if (!dst) return;
    dst.width = src.width;
    dst.height = src.height;
    dst.getContext('2d')?.drawImage(src, 0, 0);
  });

  // Strip elements marked pdf-exclude (duration, photo capture line, etc.) — on-screen only.
  clone.querySelectorAll('.pdf-exclude').forEach(el => el.remove());

  host.appendChild(clone);
  document.body.appendChild(host);
  return { clone, cleanup: () => host.remove() };
}

/**
 * Rasterizes a DOM node to a multi-page A4 PDF with smart, content-aware
 * page breaks (no text lines or images cut in half).
 *
 * The node is re-typeset off-screen at A4 width (794 CSS px @96dpi) before
 * capture, so the PDF always uses the paper layout — regardless of whether
 * the user is on a phone (inspector PWA) or desktop (superadmin).
 * External images should be CORS-enabled for reliable capture.
 */
export async function captureElementToPdf(
  element: HTMLElement,
  filename: string,
  options: CapturePdfOptions = {}
): Promise<void> {
  const { marginMm = 6, scale = 2, windowWidth = A4_LAYOUT_PX, onProgress } = options;

  const { clone, cleanup } = mountPrintClone(element, windowWidth);
  try {
    await document.fonts?.ready;
    await waitForImages(clone);

    onProgress?.('capture', 0, 0);
    await nextFrame();

    const contentWidthMm = A4_WIDTH_MM - marginMm * 2;
    const contentHeightMm = A4_HEIGHT_MM - marginMm * 2;
    const expectedPageHeightPx = (contentHeightMm / contentWidthMm) * windowWidth * scale;

    // No-cut bands must be measured in the capture document, not the live
    // one: media queries there evaluate at `windowWidth` (desktop grids),
    // while on a phone the live clone is still laid out mobile-stacked.
    let bands: Band[] = [];

    const canvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      // Evaluate media queries at the print width so `sm:`/`md:` desktop
      // grids apply instead of the stacked mobile layout.
      windowWidth,
      width: windowWidth,
      onclone: doc => {
        const h = doc.getElementById(PRINT_HOST_ID);
        if (h) h.style.visibility = 'visible';
        const target = doc.querySelector('[data-pdf-root]') as HTMLElement | null;
        if (target) {
          target.querySelectorAll('.pdf-exclude').forEach(el => el.remove());
          bands = collectNoCutBands(target, scale, expectedPageHeightPx);
        }
      },
    });

    const pageHeightPx = (contentHeightMm / contentWidthMm) * canvas.width;

    const cuts = computeCutPoints(canvas, bands, pageHeightPx);

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
    let prev = 0;
    for (let i = 0; i < cuts.length; i++) {
      onProgress?.('page', i + 1, cuts.length);
      await nextFrame();
      const cut = cuts[i];
      const sliceH = Math.max(1, Math.floor(cut - prev));
      const imgData = sliceToDataUrl(canvas, Math.floor(prev), sliceH);
      const sliceHeightMm = (sliceH / canvas.width) * contentWidthMm;
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidthMm, Math.min(sliceHeightMm, contentHeightMm), undefined, 'FAST');
      prev = cut;
    }

    pdf.save(filename);
  } finally {
    cleanup();
  }
}
