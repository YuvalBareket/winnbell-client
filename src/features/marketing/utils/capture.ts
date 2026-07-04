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

// ── Capture a DOM node to PNG and trigger a download ─────────────────────────
// Swaps every inner SVG for a raster copy first (html2canvas can't paint QR svgs),
// captures, restores the DOM, then downloads. Throws on failure so callers can toast.
// The node's own CSS transform (preview downscale) is removed for the capture -
// html2canvas mis-crops transformed nodes - and restored after.
export async function downloadNodeAsPng(node: HTMLElement, filename: string, scale = 2): Promise<void> {
  const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];
  const savedTransform = node.style.transform;
  node.style.transform = 'none';
  try {
    const svgEls = Array.from(node.querySelectorAll<SVGSVGElement>('svg'));
    for (const svg of svgEls) {
      const pngUrl = await svgToPngDataUrl(svg, 3);
      const img = document.createElement('img');
      img.src = pngUrl;
      const w = svg.clientWidth || Number(svg.getAttribute('width') ?? 150);
      const h = svg.clientHeight || Number(svg.getAttribute('height') ?? 150);
      img.style.cssText = `width:${w}px;height:${h}px;display:block;`;
      svg.parentNode!.insertBefore(img, svg);
      svg.style.display = 'none';
      swaps.push({ svg, img });
    }

    const canvas = await html2canvas(node, {
      scale,
      width: node.clientWidth,
      height: node.clientHeight,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 0,
    });

    swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch (err) {
    swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
    throw err;
  } finally {
    node.style.transform = savedTransform;
  }
}
