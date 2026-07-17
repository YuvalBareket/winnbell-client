import html2canvas from 'html2canvas';

// ── SVG → PNG helper (ensures QR svgs render in html2canvas) ─────────────────
export async function svgToPngDataUrl(svgEl: SVGSVGElement, scale = 3): Promise<string> {
  const w = svgEl.clientWidth || Number(svgEl.getAttribute('width') ?? 150);
  const h = svgEl.clientHeight || Number(svgEl.getAttribute('height') ?? 150);
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ── <img src="*.svg"> → PNG data URL at the capture scale ────────────────────
// html2canvas leaves svg-sourced img elements blank (e.g. the Winnbell wordmark),
// so they must be re-pointed at a raster copy before capture.
export function svgImgToPngDataUrl(img: HTMLImageElement, scale = 3): Promise<string> {
  const w = img.clientWidth || img.naturalWidth || 100;
  const h = img.clientHeight || img.naturalHeight || 30;
  return new Promise((resolve, reject) => {
    const tmp = new Image();
    tmp.crossOrigin = 'anonymous';
    tmp.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    tmp.onerror = reject;
    tmp.src = img.src;
  });
}

// ── Capture a DOM node to an image Blob ──────────────────────────────────────
// Swaps every inner SVG element AND every svg-sourced img for raster copies first
// (html2canvas can't paint either), captures, restores the DOM. Throws on failure.
// The node's own CSS transform (preview downscale) is removed for the capture -
// html2canvas mis-crops transformed nodes - and restored after.
// format 'jpeg' is for full-bleed designs: gradients compress far smaller than PNG
// at visually identical quality. JPEG has no alpha, so transparent regions get a
// white backing - anything with transparent corners (the round sticker) stays PNG.
export async function captureNodeToBlob(node: HTMLElement, scale = 2, format: 'png' | 'jpeg' = 'png'): Promise<Blob> {
  const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];
  const logoSwaps: Array<{ img: HTMLImageElement; originalSrc: string }> = [];
  const savedTransform = node.style.transform;
  node.style.transform = 'none';
  const restore = () => {
    swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
    logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
  };
  try {
    const svgEls = Array.from(node.querySelectorAll<SVGSVGElement>('svg'));
    for (const svg of svgEls) {
      const pngUrl = await svgToPngDataUrl(svg, scale + 1);
      const img = document.createElement('img');
      img.src = pngUrl;
      const w = svg.clientWidth || Number(svg.getAttribute('width') ?? 150);
      const h = svg.clientHeight || Number(svg.getAttribute('height') ?? 150);
      img.style.cssText = `width:${w}px;height:${h}px;display:block;`;
      svg.parentNode!.insertBefore(img, svg);
      svg.style.display = 'none';
      swaps.push({ svg, img });
    }

    const svgImgEls = Array.from(node.querySelectorAll<HTMLImageElement>('img[src$=".svg"]'));
    for (const imgEl of svgImgEls) {
      const originalSrc = imgEl.src;
      const pngUrl = await svgImgToPngDataUrl(imgEl, scale + 1);
      imgEl.src = pngUrl;
      // Wait for the browser to apply the new src before capture.
      await new Promise<void>((r) => { const t = new Image(); t.onload = () => r(); t.onerror = () => r(); t.src = pngUrl; });
      logoSwaps.push({ img: imgEl, originalSrc });
    }

    const canvas = await html2canvas(node, {
      scale,
      width: node.clientWidth,
      height: node.clientHeight,
      useCORS: true,
      backgroundColor: format === 'jpeg' ? '#ffffff' : null,
      logging: false,
      imageTimeout: 0,
    });

    restore();

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Image capture failed'))),
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        format === 'jpeg' ? 0.92 : 1.0,
      );
    });
  } catch (err) {
    restore();
    throw err;
  } finally {
    node.style.transform = savedTransform;
  }
}

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// ── Capture a DOM node to an image and trigger a browser download ────────────
export async function downloadNodeAsPng(node: HTMLElement, filename: string, scale = 2, format: 'png' | 'jpeg' = 'png'): Promise<void> {
  const blob = await captureNodeToBlob(node, scale, format);
  triggerBlobDownload(blob, filename);
}

// ── Capture a DOM node and hand it to the native share sheet when available ──
// A web page cannot write into the phone's gallery directly; the closest thing is
// the OS share sheet (navigator.share with a file), where "Save Image" stores it
// in Photos/Gallery and Instagram can be targeted directly. preferShare should be
// true only on touch devices - desktop share dialogs are worse than a download.
// Falls back to a normal download whenever sharing is unavailable or fails.
export async function saveNodeImage(
  node: HTMLElement, filename: string, scale = 2, format: 'png' | 'jpeg' = 'png', preferShare = false,
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await captureNodeToBlob(node, scale, format);
  if (preferShare && typeof navigator.canShare === 'function') {
    const file = new File([blob], filename, { type: format === 'jpeg' ? 'image/jpeg' : 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return 'shared';
      } catch (err) {
        // User closed the sheet: not an error, and do not double-deliver a download
        if (err instanceof Error && err.name === 'AbortError') return 'cancelled';
        // Any other failure (e.g. lost user-activation window): fall back to download
      }
    }
  }
  triggerBlobDownload(blob, filename);
  return 'downloaded';
}
