import { useState } from 'react';
import { getReceiptUploadUrl } from '../api/ticketsApi';
import { trackFunnel } from '../../../shared/analytics/funnel';

// Original-file guard protects canvas memory only - the upload is the compressed WebP
// (JPEG on Safari, 4000px max), so large phone photos must pass. The server's 10 MB presign
// cap applies to the COMPRESSED size, which stays far below it (~1-4 MB at q0.92/0.85).
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB original file
// A long receipt is a thin vertical strip in the frame, so downscaling the whole photo's
// longest side to 1920px rendered the actual text at a tiny effective resolution and OCR
// could not read it (observed on a real Hebrew Shufersal receipt 2026-08-27). Keep phone
// photos near full-res so the text survives; file size stays well under the 10 MB caps.
const MAX_DIMENSION = 4000;              // keep receipt text readable for OCR
const WEBP_QUALITY = 0.92;
// Safari cannot encode WebP: canvas.toBlob('image/webp') silently falls back to PNG, and a
// 4000px photographic PNG is ~15-25 MB - over the server's 10 MB presign cap, so every iOS
// camera photo failed to upload (prod incident 2026-08-31). When that fallback is detected
// re-encode as JPEG, which every browser supports and keeps a 4000px photo at ~2-4 MB.
const JPEG_FALLBACK_QUALITY = 0.85;

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

// The presign endpoint's 4xx messages are curated and user-actionable (e.g. the 10 MB cap);
// hiding them behind generic copy left users guessing (prod incident 2026-08-31). 5xx and
// R2 PUT failures carry no user-facing message, so those keep the generic copy.
const serverMessage = (err: unknown): string | null => {
  const status = (err as { response?: { status?: number } }).response?.status;
  const message = (err as { response?: { data?: { message?: unknown } } }).response?.data?.message;
  return status !== undefined && status < 500 && typeof message === 'string' ? message : null;
};

// Retry only transient failures: network-level errors (no HTTP status: stall, abort,
// connection drop) and 5xx. A 4xx (413 too large, 403 bad signature, 401 expired session)
// is deterministic - retrying re-fails and, worse, burns entryLimiter budget (5/min shared
// with entry submission), so a retry storm could 429 an honest user out of submitting.
const isRetriable = (err: unknown): boolean => {
  const status = (err as { status?: number; response?: { status?: number } }).status
    ?? (err as { response?: { status?: number } }).response?.status;
  return status === undefined || status >= 500;
};

// R2 accepts these directly; anything else (HEIC, PDF-rendered, etc.) must be re-encoded.
const PASSTHROUGH_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Only skip compression for genuinely small files. An already-small image is almost
// certainly already compressed (re-encoding it just adds loss + bytes), while anything
// larger is worth downscaling/re-encoding to keep storage and upload time in check. Well
// under the server's 10 MB presign cap, so a passthrough never risks the signature.
const PASSTHROUGH_MAX_BYTES = 2 * 1024 * 1024;

const loadImageEl = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(objectUrl); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { if (blob) { resolve(blob); } else { reject(new Error('Conversion failed')); } },
      type,
      quality,
    );
  });

// Probed ONCE on a 1x1 canvas (sub-millisecond) so the real photo is never encoded twice -
// a wasted full-size PNG pass on a 4000px canvas costs ~1s + a large allocation on phones.
let webpEncodeSupport: Promise<boolean> | null = null;
const canEncodeWebP = (): Promise<boolean> => {
  webpEncodeSupport ??= new Promise((resolve) => {
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    // Spec guarantees the callback fires, but a hung probe here would stall EVERY upload
    // forever - strictly worse than the bug this fixes. Resolving false takes the JPEG
    // path, which every browser can encode; real browsers answer in <10ms.
    const fallback = setTimeout(() => resolve(false), 2_000);
    probe.toBlob((blob) => { clearTimeout(fallback); resolve(blob?.type === 'image/webp'); }, 'image/webp');
  });
  return webpEncodeSupport;
};

const encodeImage = async (img: HTMLImageElement): Promise<Blob> => {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const useWebP = await canEncodeWebP();
  const blob = useWebP
    ? await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY)
    : await canvasToBlob(canvas, 'image/jpeg', JPEG_FALLBACK_QUALITY);
  // Safety net: if the browser STILL produced a different type than the probe promised
  // (Safari's fallback is silent), one jpeg re-encode beats an oversized-PNG upload failure.
  if (blob.type !== 'image/webp' && blob.type !== 'image/jpeg') {
    return canvasToBlob(canvas, 'image/jpeg', JPEG_FALLBACK_QUALITY);
  }
  return blob;
};

// Re-encoding an already-compressed photo (e.g. a WhatsApp-forwarded JPEG) only re-applies
// lossy compression to pixels that already lost detail: it adds a second generation of loss
// AND, at high quality, often INFLATES the file by faithfully preserving the prior codec's
// artifacts (a 347 KB WhatsApp JPEG came back as a 591 KB webp, no more readable). So only
// re-encode when we MUST - an oversized image that needs downscaling for the model, or a
// format R2 will not accept. Otherwise upload the original bytes untouched.
const prepareUpload = async (file: File): Promise<{ body: Blob; contentType: string }> => {
  const img = await loadImageEl(file);
  const withinCap = Math.max(img.width, img.height) <= MAX_DIMENSION;
  const supported = PASSTHROUGH_TYPES.includes(file.type);
  if (withinCap && supported && file.size <= PASSTHROUGH_MAX_BYTES) {
    return { body: file, contentType: file.type };
  }
  // The blob's own type (webp, or jpeg on Safari) is what gets signed into the presigned
  // URL and sent on the PUT - a hardcoded type here would break the R2 signature match.
  const encoded = await encodeImage(img);
  return { body: encoded, contentType: encoded.type };
};

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
    let prepared: { body: Blob; contentType: string };
    try {
      // PDFs (e.g. emailed receipts) are rendered to an image first so the rest of
      // the pipeline (upload, review views, OCR) stays image-only. The PDF engine is
      // lazy-loaded - only users who actually pick a PDF download it.
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      let imageFile = file;
      if (isPdf) {
        const { pdfFirstPageToImage } = await import('../../../shared/lib/pdfToImage');
        imageFile = await pdfFirstPageToImage(file);
      }
      prepared = await prepareUpload(imageFile);
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
      // The exact size AND content-type are signed into the upload URL server-side (hard cap
      // + type enforcement); the PUT must send both to match the signature.
      const { uploadUrl, publicUrl } = await getReceiptUploadUrl(prepared.body.size, prepared.contentType);
      // fetch only rejects on network/CSP failure; a non-2xx from R2 (e.g. expired
      // presigned URL) resolves normally, so check res.ok or a dead image URL is returned.
      const attemptPut = async (): Promise<string> => {
        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: prepared.body,
          headers: { 'Content-Type': prepared.contentType },
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
        : serverMessage(err) ?? 'Failed to upload the file. Please try a different image or PDF.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, clearError: () => setError(null) };
};
