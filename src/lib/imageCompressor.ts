/**
 * Canvas-based JPEG compression (Prompt 05).
 * Accepts Blob/File or an existing canvas (e.g. video frame capture).
 */

export type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

export async function compressImage(
  source: Blob | File | HTMLCanvasElement,
  options: CompressImageOptions = {}
): Promise<{ blob: Blob; sizeKb: number; width: number; height: number }> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options;

  if (source instanceof HTMLCanvasElement) {
    return compressCanvas(source, maxWidth, maxHeight, quality);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(source);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No 2D context'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        void finishCanvas(canvas, quality).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

function compressCanvas(
  source: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ blob: Blob; sizeKb: number; width: number; height: number }> {
  let { width, height } = source;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  const w = Math.round(width);
  const h = Math.round(height);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('No 2D context'));
  ctx.drawImage(source, 0, 0, w, h);
  return finishCanvas(canvas, quality);
}

function finishCanvas(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<{ blob: Blob; sizeKb: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Compression failed'));
        resolve({
          blob,
          sizeKb: Math.round(blob.size / 1024),
          width: canvas.width,
          height: canvas.height,
        });
      },
      'image/jpeg',
      quality
    );
  });
}
