import * as pdfjsLib from 'pdfjs-dist';
// Vite resolves this to a hashed URL for the bundled worker (no CDN, works offline in the PWA).
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

/**
 * Render the first page of a PDF into a PNG image File so the rest of the
 * annotation pipeline (which expects an image) can treat it like a photo.
 * Scaled so the long edge is ~1600px - crisp enough to read the receipt number
 * without producing an enormous blob.
 */
export const pdfFirstPageToImage = async (file: File): Promise<File> => {
  const data = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  try {
    const page = await pdf.getPage(1);

    const base = page.getViewport({ scale: 1 });
    // Render at ~2200px on the long edge so small receipt text stays sharp when zoomed.
    const scale = Math.min(2200 / Math.max(base.width, base.height), 4);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context for PDF render');

    // White backing so transparent PDFs don't render onto a black canvas.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );
    if (!blob) throw new Error('Could not export PDF page to image');

    const name = file.name.replace(/\.pdf$/i, '') || 'receipt';
    return new File([blob], `${name}.png`, { type: 'image/png' });
  } finally {
    loadingTask.destroy();
  }
};
