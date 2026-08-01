import { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, CircularProgress, Dialog, Stack, Typography, IconButton, useMediaQuery } from '@mui/material';
import { CloudUpload, UndoOutlined, DeleteOutlineOutlined, RemoveRounded, AddRounded, EditOutlined, PanToolOutlined, CloseRounded, LineWeightRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCanvasAnnotation } from '../hooks/useCanvasAnnotation';
import { pdfFirstPageToImage } from '../lib/pdfToImage';
import { MARKER_YELLOW, MARKER_BLACK, ALPHA_WHITE_15 } from '../colors';

export interface CanvasEditorHandle {
  /** Flatten the annotation to a blob and hand it to onSave. */
  save: () => Promise<void>;
  undo: () => void;
  clear: () => void;
  newPhoto: () => void;
}

interface CanvasAnnotationEditorProps {
  imgFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSave: (blob: Blob) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  instructionText?: string;
  /** Hide the built-in Save button (the parent drives saving via the ref instead). */
  hideSaveButton?: boolean;
  /** Hide the red "draw over the number" instruction banner. */
  hideInstruction?: boolean;
  /** Hide the built-in Undo/Clear/New-photo toolbar (the parent renders its own via the ref). */
  hideToolbar?: boolean;
  /** Notified whenever the drawn-path count changes (so a parent can disable Undo/Clear). */
  onPathCountChange?: (count: number) => void;
}

const CanvasAnnotationEditor = forwardRef<CanvasEditorHandle, CanvasAnnotationEditorProps>(({
  imgFile,
  onFileSelect,
  onSave,
  isSaving = false,
  instructionText = 'Drag across the receipt number to highlight it for customers. Switch to the black marker to cover anything private.',
  hideSaveButton = false,
  hideInstruction = false,
  hideToolbar = false,
  onPathCountChange,
}, ref) => {
  // imgFile and onPathCountChange are passed directly into the hook:
  //   - imgFile: hook mirrors the controlled prop instead of owning state (2.2)
  //   - onPathCountChange: hook invokes via ref at mutation sites, no notify effect needed (2.17)
  const {
    canvasRef,
    fileInputRef,
    imgFile: internalImgFile,
    setImgFile,
    pathCount,
    zoom,
    tool,
    setTool,
    marker,
    setMarker,
    brushLevel,
    setBrushLevel,
    brushLevelCount,
    minScale,
    maxScale,
    zoomIn,
    zoomOut,
    resetZoom,
    handleUndo,
    handleClearAll,
    getAnnotatedBlob,
  } = useCanvasAnnotation(imgFile, onPathCountChange);

  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [exampleOpen, setExampleOpen] = useState(false);

  // Show the Draw/Move toggle whenever a mouse/trackpad exists (a single pointer can't do the
  // one-finger-draw / two-finger-pan trick). 'any-pointer: fine' stays true on touchscreen
  // laptops with a mouse, unlike 'pointer: coarse' which reports the primary pointer only.
  const hasFinePointer = useMediaQuery('(any-pointer: fine)');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0] ?? null;
    // Reset the input so picking the same file again still fires onChange.
    e.target.value = '';
    setFileError(null);
    if (!raw) return;

    // PDFs are rendered to an image (first page) so they flow through the same annotation pipeline.
    if (raw.type === 'application/pdf' || /\.pdf$/i.test(raw.name)) {
      setIsProcessing(true);
      try {
        const image = await pdfFirstPageToImage(raw);
        setImgFile(image);
        onFileSelect(image);
      } catch (err) {
        console.error('[CanvasAnnotationEditor] PDF render failed:', err);
        setFileError('Could not read that PDF. Try a photo or a different file.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setImgFile(raw);
    onFileSelect(raw);
  };

  const handleNewPhoto = () => {
    setImgFile(null);
    onFileSelect(null);
  };

  const handleSaveClick = async () => {
    const blob = await getAnnotatedBlob();
    onSave(blob);
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveClick,
    undo: handleUndo,
    clear: handleClearAll,
    newPhoto: handleNewPhoto,
  }));

  if (!internalImgFile) {
    return (
      <>
        {/* One-line pointer to the finished example, right under the Receipt example header */}
        <Typography variant='body2' sx={{ mb: 1.5, color: 'text.secondary', fontWeight: 500 }}>
          <Box
            component='span'
            role='button'
            tabIndex={0}
            onClick={() => setExampleOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExampleOpen(true); }}
            sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Click to see an example
          </Box>
          {' '}of how your marked receipt should look.
        </Typography>

        <Box
          role="button"
          tabIndex={0}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isProcessing) fileInputRef.current?.click(); } }}
          sx={{
            border: '2px dashed', borderColor: fileError ? 'error.main' : 'divider', borderRadius: 2,
            minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', cursor: isProcessing ? 'default' : 'pointer', mb: fileError ? 1.5 : 3,
            transition: 'all 0.18s',
            '&:hover': isProcessing ? {} : { borderColor: 'primary.main', bgcolor: 'rgba(25,93,230,0.03)' },
            '&:active': isProcessing ? {} : { transform: 'scale(0.99)' },
          }}
        >
          <Stack alignItems='center' spacing={1.5} sx={{ p: 4 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: 'rgba(25,93,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isProcessing
                ? <CircularProgress size={26} />
                : <CloudUpload sx={{ fontSize: 28, color: 'primary.main' }} />}
            </Box>
            <Typography variant='body1' fontWeight={800} color='text.primary'>
              {isProcessing ? 'Reading your PDF...' : 'Upload a receipt photo or PDF'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5,  }}>
              {isProcessing
                ? 'Turning the first page into an image you can mark up.'
                : 'Make sure to upload a clear, high-quality image.'}
            </Typography>
          </Stack>
        </Box>
        {fileError && (
          <Typography variant='body2' sx={{ color: 'error.main', fontWeight: 600, mb: 3 }}>
            {fileError}
          </Typography>
        )}

        {/* Full-screen viewer for the example receipt */}
        <Dialog fullScreen open={exampleOpen} onClose={() => setExampleOpen(false)} PaperProps={{ sx: { bgcolor: 'common.black' } }}>
          <Box
            role="button"
            tabIndex={0}
            aria-label="Close example"
            onClick={() => setExampleOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExampleOpen(false); } }}
            sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'zoom-out' }}
          >
            <Box
              component={motion.img}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src='/receiptExample.webp'
              alt='Example receipt with the receipt number highlighted in yellow'
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: { xs: 1, sm: 3 } }}
            />
            <IconButton
              onClick={() => setExampleOpen(false)}
              aria-label='Close example'
              sx={{
                position: 'absolute', right: 12, top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
                color: 'common.white', bgcolor: ALPHA_WHITE_15, '&:hover': { bgcolor: ALPHA_WHITE_15 },
              }}
            >
              <CloseRounded />
            </IconButton>
          </Box>
        </Dialog>

        <input ref={fileInputRef} type='file' accept='image/*,application/pdf' hidden onChange={handleFileChange} />
      </>
    );
  }

  return (
    <>
      {/* Instruction */}
      {!hideInstruction && (
        <Box sx={{ bgcolor: 'rgba(251, 234, 73, 0.06)', border: '1px solid rgba(219, 210, 33, 0.42)', borderRadius: 2, p: 1.75, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1, mt: 0.1 }}>✏️</Typography>
          <Typography variant='body2' sx={{  fontWeight: 600, lineHeight: 1.5 }}>
            {instructionText}
          </Typography>
        </Box>
      )}

      {/* Canvas viewport: the receipt is drawn (pan + zoom) inside the canvas, so it always
          fits at 1x and no gesture ever leaks to the page. */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          mb: 1,
          overflow: 'hidden',
          height: { xs: 360, md: 460 },
          bgcolor: 'action.hover',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: hasFinePointer && tool === 'pan' ? 'grab' : 'crosshair',
            // Pure touch (no mouse): 'none' so one finger always draws (two fingers zoom/pan).
            // With a mouse present, Draw uses pan-y (vertical page scroll) and Move uses none.
            touchAction: !hasFinePointer ? 'none' : (tool === 'pan' ? 'none' : 'pan-y'),
          }}
        />

        {/* Draw / Move tool toggle (shown when a mouse exists; touch uses finger count instead) */}
        {hasFinePointer && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}
          >
            <Stack
              direction='row'
              spacing={0.25}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 999,
                p: 0.25,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <IconButton
                size='small'
                onClick={() => setTool('draw')}
                aria-label='Draw tool'
                sx={{ color: tool === 'draw' ? 'primary.main' : 'text.secondary', bgcolor: tool === 'draw' ? 'action.selected' : 'transparent' }}
              >
                <EditOutlined sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size='small'
                onClick={() => setTool('pan')}
                aria-label='Move tool'
                sx={{ color: tool === 'pan' ? 'primary.main' : 'text.secondary', bgcolor: tool === 'pan' ? 'action.selected' : 'transparent' }}
              >
                <PanToolOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Marker picker: translucent yellow highlighter vs opaque black cover marker */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
        >
          <Stack
            direction='row'
            spacing={0.25}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 999,
              p: 0.25,
              boxShadow: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton
              size='small'
              onClick={() => { setMarker('highlight'); setTool('draw'); }}
              aria-label='Yellow highlighter marker'
              sx={{ bgcolor: marker === 'highlight' ? 'action.selected' : 'transparent' }}
            >
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: MARKER_YELLOW, border: '1px solid', borderColor: 'divider' }} />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => { setMarker('cover'); setTool('draw'); }}
              aria-label='Black cover marker'
              sx={{ bgcolor: marker === 'cover' ? 'action.selected' : 'transparent' }}
            >
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: MARKER_BLACK }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Zoom control pill, overlaid bottom-right of the viewport */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          sx={{ position: 'absolute', bottom: 12, right: 12, zIndex: 2 }}
        >
          <Stack
            direction='row'
            alignItems='center'
            spacing={0.25}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 999,
              px: 0.5,
              py: 0.25,
              boxShadow: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <IconButton size='small' onClick={zoomOut} disabled={zoom <= minScale} aria-label='Zoom out'>
              <RemoveRounded sx={{ fontSize: 18 }} />
            </IconButton>
            <Button
              size='small'
              onClick={resetZoom}
              disabled={zoom <= minScale}
              sx={{ minWidth: 44, px: 0.5, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
            >
              {Math.round(zoom * 100)}%
            </Button>
            <IconButton size='small' onClick={zoomIn} disabled={zoom >= maxScale} aria-label='Zoom in'>
              <AddRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Brush thickness picker: each dot is a preset width. Only strokes drawn after a
            change take the new width; existing marks keep the size they were drawn at. */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 2 }}
        >
          <Stack
            direction='row'
            alignItems='center'
            spacing={0.25}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 999,
              px: 0.5,
              py: 0.25,
              boxShadow: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <LineWeightRounded sx={{ fontSize: { xs: 15, sm: 18 }, color: 'text.secondary', ml: 0.25, mr: 0.25 }} />
            {Array.from({ length: brushLevelCount }, (_, i) => (
              <IconButton
                key={i}
                size='small'
                onClick={() => setBrushLevel(i)}
                aria-label={`Brush thickness ${i + 1}`}
                sx={{ width: { xs: 24, sm: 30 }, height: { xs: 24, sm: 30 }, bgcolor: brushLevel === i ? 'action.selected' : 'transparent' }}
              >
                <Box
                  sx={{
                    width: 5 + i * 4,
                    height: 5 + i * 4,
                    borderRadius: '50%',
                    bgcolor: brushLevel === i ? 'primary.main' : 'text.secondary',
                  }}
                />
              </IconButton>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Interaction hint */}
      <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', mb: 2, textAlign: 'center' }}>
        {hasFinePointer
          ? 'Yellow highlights the number, black covers private info. Tap the hand to move around. Ctrl-scroll to zoom.'
          : 'One finger to draw. Two fingers to zoom and move. Yellow highlights, black covers private info.'}
      </Typography>

      {/* Toolbar */}
      {!hideToolbar && (
        <Stack direction='row' spacing={1} sx={{ mb: 3 }}>
          <Button variant='outlined' size='small' startIcon={<UndoOutlined />} onClick={handleUndo}
            disabled={pathCount === 0} sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
            Undo
          </Button>
          <Button variant='outlined' size='small' startIcon={<DeleteOutlineOutlined />} onClick={handleClearAll}
            disabled={pathCount === 0} sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
            Clear
          </Button>
          <Button variant='outlined' size='small' onClick={handleNewPhoto}
            sx={{ flex: 1, textTransform: 'none', fontWeight: 700 }}>
            New photo
          </Button>
        </Stack>
      )}

      <input ref={fileInputRef} type='file' accept='image/*,application/pdf' hidden onChange={handleFileChange} />

      {!hideSaveButton && (
        <Button fullWidth variant='contained' size='large' onClick={handleSaveClick} disabled={isSaving}
          sx={{ py: 1.875, fontWeight: 800, fontSize: '1rem', textTransform: 'none', mb: 1.5, boxShadow: '0 4px 14px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.4)' } }}>
          {isSaving ? <CircularProgress size={22} color='inherit' /> : 'Save & Continue →'}
        </Button>
      )}
    </>
  );
});

CanvasAnnotationEditor.displayName = 'CanvasAnnotationEditor';

export default CanvasAnnotationEditor;
