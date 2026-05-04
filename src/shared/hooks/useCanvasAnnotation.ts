import { useState, useRef, useEffect } from 'react';

export const useCanvasAnnotation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [pathCount, setPathCount] = useState(0);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const drawPath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };
    pathsRef.current.forEach(drawPath);
    if (currentPathRef.current.length > 1) drawPath(currentPathRef.current);
  };

  useEffect(() => {
    if (!imgFile) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const containerW = canvasContainerRef.current?.clientWidth || 480;
      const maxH = 380;
      const scale = Math.min(containerW / img.width, maxH / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      pathsRef.current = [];
      currentPathRef.current = [];
      setPathCount(0);
      redrawCanvas();
    };
    img.src = URL.createObjectURL(imgFile);
  }, [imgFile]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const client = 'touches' in e ? e.touches[0] : e;
    return {
      x: (client.clientX - rect.left) * scaleX,
      y: (client.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imgFile) return;
    isDrawingRef.current = true;
    currentPathRef.current = [getCanvasPos(e)];
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ('touches' in e) e.preventDefault();
    currentPathRef.current = [...currentPathRef.current, getCanvasPos(e)];
    redrawCanvas();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current.length > 1) {
      pathsRef.current = [...pathsRef.current, currentPathRef.current];
      setPathCount(pathsRef.current.length);
    }
    currentPathRef.current = [];
    redrawCanvas();
  };

  const handleUndo = () => {
    pathsRef.current = pathsRef.current.slice(0, -1);
    setPathCount(pathsRef.current.length);
    redrawCanvas();
  };

  const handleClearAll = () => {
    pathsRef.current = [];
    currentPathRef.current = [];
    setPathCount(0);
    redrawCanvas();
  };

  const getAnnotatedBlob = (): Promise<Blob> =>
    new Promise<Blob>((res) =>
      canvasRef.current!.toBlob((b) => res(b!), 'image/jpeg', 0.92),
    );

  return {
    canvasRef,
    canvasContainerRef,
    imgRef,
    fileInputRef,
    imgFile,
    setImgFile,
    pathCount,
    redrawCanvas,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleUndo,
    handleClearAll,
    getAnnotatedBlob,
  };
};
