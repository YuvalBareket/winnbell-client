import { useState } from 'react';
import { getReceiptUploadUrl } from '../api/ticketsApi';
import { trackFunnel } from '../../../shared/analytics/funnel';

// Original-file guard protects canvas memory only - the upload is the compressed WebP
// (1920px max), so large phone photos must pass. The server's 10 MB presign cap applies
// to the COMPRESSED size, which stays far below it.
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB original file
const MAX_DIMENSION = 1920;              // keep receipts readable
const WEBP_QUALITY = 0.9;

// A stalled mobile PUT used to spin forever (2026-08-24 staging complaint: ~50s hang,
// user reloaded and gave up). Bound it, retry once with a FRESH presigned URL, and only
// then surface an error - so a transient network/R2 blip self-heals.
const PUT_TIMEOUT_MS = 45_000;
const RETRY_DELAY_MS = 1_500;

// AbortSignal.timeout is missing on older WebViews (iOS <16); undefined = old unbounded
// behavior there, which only loses the timeout, never the upload.
const putTimeoutSignal = (): AbortSignal | undefined =>
  typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
    ? AbortSignal.timeout(PUT_TIMEOUT_MS)
    : undefined;

// Covers the native fetch abort (PUT timeout) and axios ECONNABORTED (presign timeout) -
// both mean "the network stalled", which is what the timeout-specific message describes.
const isTimeoutError = (err: unknown): boolean =>
  (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError'))
  || (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'ECONNABORTED');

// Retry only transient failures: network-level errors (no HTTP status: stall, abort,
// connection drop) and 5xx. A 4xx (413 too large, 403 bad signature, 401 expired session)
// is deterministic - retrying re-fails and, worse, burns entryLimiter budget (5/min shared
// with entry submission), so a retry storm could 429 an honest user out of submitting.
const isRetriable = (err: unknown): boolean => {
  const status = (err as { status?: number; response?: { status?: number } }).status
    ?? (err as { response?: { status?: number } }).response?.status;
  return status === undefined || status >= 500;
};

const convertToWebP = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not available')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Conversion failed')); return; }
          resolve(new File([blob], 'receipt.webp', { type: 'image/webp' }));
        },
        'image/webp',
        WEBP_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });

export const useUploadReceiptImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    if (file.size > MAX_SIZE_BYTES) {
      setError('File must be under 25 MB.');
      return null;
    }

    setError(null);
    setIsUploading(true);

    // Client-side processing first (deterministic - a retry cannot fix these).
    let webpFile: File;
    try {
      // PDFs (e.g. emailed receipts) are rendered to an image first so the rest of
      // the pipeline (WebP upload, review views, OCR) stays image-only. The PDF
      // engine is lazy-loaded - only users who actually pick a PDF download it.
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      let imageFile = file;
      if (isPdf) {
        const { pdfFirstPageToImage } = await import('../../../shared/lib/pdfToImage');
        imageFile = await pdfFirstPageToImage(file);
      }
      webpFile = await convertToWebP(imageFile);
    } catch (err) {
      console.error('[receipt-upload] convert failed:', err instanceof Error ? err.message : err);
      trackFunnel('submit_image_upload_failed', { meta: { stage: 'convert' }, flushNow: true });
      setError('Failed to upload the file. Please try a different image or PDF.');
      setIsUploading(false);
      return null;
    }

    // The network leg: presign ONCE, then PUT with one retry against the SAME URL.
    // One presign per upload attempt keeps the entryLimiter cost identical to before the
    // retry existed (the URL's 5-minute TTL far outlives both PUT attempts), and retrying
    // the same object key means a "first PUT actually landed but its response was lost"
    // duplicate simply overwrites itself - never an orphaned second object in R2.
    try {
      // The exact size is signed into the upload URL server-side (hard cap enforcement)
      const { uploadUrl, publicUrl } = await getReceiptUploadUrl(webpFile.size);
      // fetch only rejects on network/CSP failure; a non-2xx from R2 (e.g. expired
      // presigned URL) resolves normally, so check res.ok or a dead image URL is returned.
      const attemptPut = async (): Promise<string> => {
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: webpFile,
          headers: { 'Content-Type': 'image/webp' },
          signal: putTimeoutSignal(),
        });
        if (!res.ok) throw Object.assign(new Error(`Upload failed (${res.status})`), { status: res.status });
        return publicUrl;
      };
      try {
        return await attemptPut();
      } catch (err) {
        if (!isRetriable(err)) throw err;
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return await attemptPut();
      }
    } catch (err) {
      trackFunnel('submit_image_upload_failed', { meta: { stage: 'upload' }, flushNow: true });
      setError(isTimeoutError(err)
        ? 'The upload is taking too long. Please check your connection and try again.'
        : 'Failed to upload the file. Please try a different image or PDF.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, clearError: () => setError(null) };
};
