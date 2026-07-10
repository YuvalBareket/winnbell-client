import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, CircularProgress, Stack, Typography, IconButton, useMediaQuery } from '@mui/material';
import { CloudUpload, UndoOutlined, DeleteOutlineOutlined, RemoveRounded, AddRounded, EditOutlined, PanToolOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCanvasAnnotation } from '../hooks/useCanvasAnnotation';
import { pdfFirstPageToImage } from '../lib/pdfToImage';

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
  instructionText = 'Drag across the receipt number to draw a line over it and highlight it for customers',
  hideSaveButton = false,
  hideInstruction = false,
  hideToolbar = false,
  onPathCountChange,
}, ref) => {
  const {
    canvasRef,
    fileInputRef,
    imgFile: internalImgFile,
    setImgFile,
    pathCount,
    zoom,
    tool,
    setTool,
    minScale,
    maxScale,
    zoomIn,
    zoomOut,
    resetZoom,
    handleUndo,
    handleClearAll,
    getAnnotatedBlob,
  } = useCanvasAnnotation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Show the Draw/Move toggle whenever a mouse/trackpad exists (a single pointer can't do the
  // one-finger-draw / two-finger-pan trick). 'any-pointer: fine' stays true on touchscreen
  // laptops with a mouse, unlike 'pointer: coarse' which reports the primary pointer only.
  const hasFinePointer = useMediaQuery('(any-pointer: fine)');

  // Sync controlled prop into hook state
  useEffect(() => {
    setImgFile(imgFile);
  }, [imgFile, setImgFile]);

  // Let a parent that renders its own toolbar know when Undo/Clear should be enabled.
  useEffect(() => {
    onPathCountChange?.(pathCount);
  }, [pathCount, onPathCountChange]);

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
        <Box
          onClick={() => !isProcessing && fileInputRef.current?.click()}
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
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5, maxWidth: 280 }}>
              {isProcessing
                ? 'Turning the first page into an image you can mark up.'
                : "Take a photo or upload a PDF of any receipt from your store - then you'll mark where the receipt number is"}
            </Typography>
          </Stack>
        </Box>
        {fileError && (
          <Typography variant='body2' sx={{ color: 'error.main', fontWeight: 600, mb: 3 }}>
            {fileError}
          </Typography>
        )}
        <input ref={fileInputRef} type='file' accept='image/*,application/pdf' hidden onChange={handleFileChange} />
      </>
    );
  }

  return (
    <>
      {/* Instruction */}
      {!hideInstruction && (
        <Box sx={{ bgcolor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 2, p: 1.75, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1, mt: 0.1 }}>✏️</Typography>
          <Typography variant='body2' sx={{ color: '#b91c1c', fontWeight: 600, lineHeight: 1.5 }}>
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
      </Box>

      {/* Interaction hint */}
      <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', mb: 2, textAlign: 'center' }}>
        {hasFinePointer
          ? 'Draw tool marks the number. Tap the hand to move around. Ctrl-scroll to zoom.'
          : 'One finger to mark the number. Two fingers to zoom and move around.'}
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
