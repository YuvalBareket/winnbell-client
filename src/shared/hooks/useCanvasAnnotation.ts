import { useState, useRef, useEffect, useCallback } from 'react';

interface Pt { x: number; y: number }

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const EXPORT_MAX_EDGE = 2400; // cap the saved guide so the file stays reasonable

const distance = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/**
 * Receipt annotation engine.
 *
 * The image and the yellow marker are drawn INSIDE the canvas through a single
 * pan/zoom transform (scale + origin), so:
 *  - the whole receipt always fits at 1x (letterboxed, never clipped);
 *  - zoom/pan stay crisp (we redraw from the source image, not a stretched bitmap);
 *  - every gesture is owned here (native, non-passive listeners) so a pinch never
 *    zooms the whole app.
 *
 * Paths are stored in IMAGE-space coordinates, which makes the exported guide
 * independent of whatever zoom the user happened to be at.
 */
export const useCanvasAnnotation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const pathsRef = useRef<Pt[][]>([]);          // committed lines, image-space
  const currentPathRef = useRef<Pt[]>([]);      // in-progress line, image-space
  const markerWidthRef = useRef(12);            // image-space px

  // View transform (canvas backing-pixel space)
  const scaleRef = useRef(1);                   // user zoom multiplier (1..MAX_SCALE)
  const originRef = useRef<Pt>({ x: 0, y: 0 }); // image top-left, in canvas px

  // Gesture bookkeeping
  const pointersRef = useRef<Map<number, Pt>>(new Map());
  const isDrawingRef = useRef(false);
  const isPanningRef = useRef(false);
  const panLastRef = useRef<Pt>({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; mid: Pt } | null>(null);

  const toolRef = useRef<'draw' | 'pan'>('draw');

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [pathCount, setPathCount] = useState(0);
  const [zoom, setZoom] = useState(1);          // mirror of scaleRef for the UI
  const [tool, setToolState] = useState<'draw' | 'pan'>('draw');

  const setTool = useCallback((t: 'draw' | 'pan') => {
    toolRef.current = t;
    setToolState(t);
  }, []);

  // ── geometry helpers (read refs only, so they stay correct without deps) ──
  const fitScale = useCallback(() => {
    const canvas = canvasRef.current; const img = imgRef.current;
    if (!canvas || !img || !img.width || !img.height) return 1;
    return Math.min(canvas.width / img.width, canvas.height / img.height);
  }, []);

  const effScale = useCallback(() => fitScale() * scaleRef.current, [fitScale]);

  const clampOrigin = useCallback(() => {
    const canvas = canvasRef.current; const img = imgRef.current;
    if (!canvas || !img) return;
    const es = effScale();
    const drawW = img.width * es;
    const drawH = img.height * es;
    const o = originRef.current;
    o.x = drawW <= canvas.width ? (canvas.width - drawW) / 2 : Math.min(0, Math.max(canvas.width - drawW, o.x));
    o.y = drawH <= canvas.height ? (canvas.height - drawH) / 2 : Math.min(0, Math.max(canvas.height - drawH, o.y));
  }, [effScale]);

  const toCanvasPx = useCallback((clientX: number, clientY: number): Pt => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }, []);

  const canvasToImage = useCallback((p: Pt): Pt => {
    const es = effScale();
    const o = originRef.current;
    return { x: (p.x - o.x) / es, y: (p.y - o.y) / es };
  }, [effScale]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Neutral backing so the letterboxed area around a portrait receipt looks intentional.
    ctx.fillStyle = '#eef1f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = imgRef.current;
    if (!img) return;

    clampOrigin();
    const es = effScale();
    const o = originRef.current;
    ctx.setTransform(es, 0, 0, es, o.x, o.y);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.globalAlpha = 1;
    ctx.drawImage(img, 0, 0);

    // Yellow highlighter marker (image-space width, so it scales with the receipt).
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = markerWidthRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const drawPath = (pts: Pt[]) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };
    pathsRef.current.forEach(drawPath);
    if (currentPathRef.current.length > 1) drawPath(currentPathRef.current);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }, [clampOrigin, effScale]);

  // Zoom toward a focal point (canvas px), keeping the image point under it fixed.
  const applyZoom = useCallback((nextScale: number, focal: Pt) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    const before = canvasToImage(focal);
    scaleRef.current = clamped;
    const es = effScale();
    originRef.current = { x: focal.x - before.x * es, y: focal.y - before.y * es };
    clampOrigin();
    setZoom(clamped);
    redraw();
  }, [canvasToImage, effScale, clampOrigin, redraw]);

  const centerFocal = useCallback((): Pt => {
    const canvas = canvasRef.current;
    return { x: (canvas?.width ?? 0) / 2, y: (canvas?.height ?? 0) / 2 };
  }, []);

  const zoomIn = useCallback(() => applyZoom(scaleRef.current + 0.5, centerFocal()), [applyZoom, centerFocal]);
  const zoomOut = useCallback(() => applyZoom(scaleRef.current - 0.5, centerFocal()), [applyZoom, centerFocal]);
  const resetZoom = useCallback(() => {
    scaleRef.current = 1;
    setZoom(1);
    clampOrigin();
    redraw();
  }, [clampOrigin, redraw]);

  // ── keep the canvas backing store matched to its displayed size (crisp on HiDPI) ──
  const syncBackingSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = Math.max(1, Math.round(rect.width * ratio));
    const h = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    clampOrigin();
    redraw();
  }, [clampOrigin, redraw]);

  // Load the image whenever the file changes.
  useEffect(() => {
    if (!imgFile) {
      // Clear the drawing surface; state (pathCount/zoom) is reset by the next image's onload.
      imgRef.current = null;
      pathsRef.current = [];
      currentPathRef.current = [];
      scaleRef.current = 1;
      originRef.current = { x: 0, y: 0 };
      redraw();
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(imgFile);
    img.onload = () => {
      imgRef.current = img;
      markerWidthRef.current = Math.max(8, Math.round(Math.min(img.width, img.height) * 0.022));
      pathsRef.current = [];
      currentPathRef.current = [];
      setPathCount(0);
      scaleRef.current = 1;
      setZoom(1);
      originRef.current = { x: 0, y: 0 };
      syncBackingSize(); // sizes backing, centers (fit) and paints
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [imgFile, redraw, syncBackingSize]);

  // Attach gesture listeners once the canvas is mounted (re-runs when the file toggles
  // the canvas in/out of the tree). Native + non-passive so preventDefault actually works.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointers = pointersRef.current;

    const onPointerDown = (e: PointerEvent) => {
      if (!imgRef.current) return;
      canvas.setPointerCapture?.(e.pointerId);
      const p = toCanvasPx(e.clientX, e.clientY);
      pointersRef.current.set(e.pointerId, p);

      if (pointersRef.current.size === 2) {
        // Second finger: abandon any draw, start pinch.
        isDrawingRef.current = false;
        isPanningRef.current = false;
        currentPathRef.current = [];
        const pts = [...pointersRef.current.values()];
        pinchRef.current = { dist: distance(pts[0], pts[1]), mid: midpoint(pts[0], pts[1]) };
        redraw();
        return;
      }

      // Pan when the Move tool is active or the user shift-drags (desktop); otherwise draw.
      const wantPan = toolRef.current === 'pan' || (e.pointerType === 'mouse' && e.shiftKey);
      if (wantPan) {
        isPanningRef.current = true;
        panLastRef.current = p;
      } else {
        isDrawingRef.current = true;
        currentPathRef.current = [canvasToImage(p)];
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      const p = toCanvasPx(e.clientX, e.clientY);
      pointersRef.current.set(e.pointerId, p);

      if (pinchRef.current && pointersRef.current.size >= 2) {
        e.preventDefault();
        const pts = [...pointersRef.current.values()];
        const nd = distance(pts[0], pts[1]);
        const nm = midpoint(pts[0], pts[1]);
        const prev = pinchRef.current;
        if (prev.dist > 0) {
          // Pan by the midpoint travel, then scale about the midpoint.
          originRef.current.x += nm.x - prev.mid.x;
          originRef.current.y += nm.y - prev.mid.y;
          applyZoom(scaleRef.current * (nd / prev.dist), nm);
        }
        pinchRef.current = { dist: nd, mid: nm };
        return;
      }

      if (isPanningRef.current) {
        e.preventDefault();
        originRef.current.x += p.x - panLastRef.current.x;
        originRef.current.y += p.y - panLastRef.current.y;
        panLastRef.current = p;
        clampOrigin();
        redraw();
        return;
      }

      if (isDrawingRef.current) {
        e.preventDefault();
        const start = currentPathRef.current[0];
        if (!start) return;
        currentPathRef.current = [start, canvasToImage(p)]; // straight line start -> current
        redraw();
      }
    };

    const endPointer = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.delete(e.pointerId);
      canvas.releasePointerCapture?.(e.pointerId);

      if (pointersRef.current.size < 2) pinchRef.current = null;

      if (pointersRef.current.size === 0) {
        isPanningRef.current = false;
        if (isDrawingRef.current) {
          isDrawingRef.current = false;
          if (currentPathRef.current.length > 1) {
            pathsRef.current = [...pathsRef.current, currentPathRef.current];
            setPathCount(pathsRef.current.length);
          }
          currentPathRef.current = [];
          redraw();
        }
      } else {
        // A finger remains after a pinch: don't silently start drawing with it.
        isDrawingRef.current = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!imgRef.current) return;
      // Only zoom on Ctrl/Cmd + wheel (trackpad pinch also sends ctrlKey). A plain wheel is left
      // alone so the page scrolls normally and the user is never trapped over the image.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const focal = toCanvasPx(e.clientX, e.clientY);
      const factor = Math.exp(-e.deltaY * 0.0022);
      applyZoom(scaleRef.current * factor, focal);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endPointer);
      canvas.removeEventListener('pointercancel', endPointer);
      canvas.removeEventListener('wheel', onWheel);
      pointers.clear();
      pinchRef.current = null;
      isDrawingRef.current = false;
      isPanningRef.current = false;
    };
  }, [imgFile, toCanvasPx, canvasToImage, applyZoom, clampOrigin, redraw]);

  // Keep the backing store sized to the element on container/viewport resize.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => syncBackingSize());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [imgFile, syncBackingSize]);

  const handleUndo = useCallback(() => {
    pathsRef.current = pathsRef.current.slice(0, -1);
    setPathCount(pathsRef.current.length);
    redraw();
  }, [redraw]);

  const handleClearAll = useCallback(() => {
    pathsRef.current = [];
    currentPathRef.current = [];
    setPathCount(0);
    redraw();
  }, [redraw]);

  // Flatten to a high-quality image at (capped) source resolution, independent of zoom.
  const getAnnotatedBlob = useCallback((): Promise<Blob> => {
    const img = imgRef.current;
    return new Promise<Blob>((resolve, reject) => {
      if (!img) { reject(new Error('No image loaded')); return; }
      const maxEdge = Math.max(img.width, img.height);
      const s = Math.min(1, EXPORT_MAX_EDGE / maxEdge);
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(img.width * s));
      off.height = Math.max(1, Math.round(img.height * s));
      const octx = off.getContext('2d');
      if (!octx) { reject(new Error('No 2d context')); return; }
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';
      octx.drawImage(img, 0, 0, off.width, off.height);
      octx.globalAlpha = 0.32;
      octx.strokeStyle = '#FFD600';
      octx.lineWidth = markerWidthRef.current * s;
      octx.lineCap = 'round';
      octx.lineJoin = 'round';
      for (const pts of pathsRef.current) {
        if (pts.length < 2) continue;
        octx.beginPath();
        octx.moveTo(pts[0].x * s, pts[0].y * s);
        for (let i = 1; i < pts.length; i++) octx.lineTo(pts[i].x * s, pts[i].y * s);
        octx.stroke();
      }
      off.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.95);
    });
  }, []);

  return {
    canvasRef,
    canvasContainerRef,
    fileInputRef,
    imgFile,
    setImgFile,
    pathCount,
    zoom,
    tool,
    setTool,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
    zoomIn,
    zoomOut,
    resetZoom,
    handleUndo,
    handleClearAll,
    getAnnotatedBlob,
  };
};
