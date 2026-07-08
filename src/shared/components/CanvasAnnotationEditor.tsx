import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { CloudUpload, UndoOutlined, DeleteOutlineOutlined } from '@mui/icons-material';
import { useCanvasAnnotation } from '../hooks/useCanvasAnnotation';

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
  instructionText = 'Draw over the receipt number with your finger or mouse to highlight it for customers',
  hideSaveButton = false,
  hideInstruction = false,
  hideToolbar = false,
  onPathCountChange,
}, ref) => {
  const {
    canvasRef,
    canvasContainerRef,
    fileInputRef,
    imgFile: internalImgFile,
    setImgFile,
    pathCount,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleUndo,
    handleClearAll,
    getAnnotatedBlob,
  } = useCanvasAnnotation();

  // Sync controlled prop into hook state
  useEffect(() => {
    setImgFile(imgFile);
  }, [imgFile, setImgFile]);

  // Let a parent that renders its own toolbar know when Undo/Clear should be enabled.
  useEffect(() => {
    onPathCountChange?.(pathCount);
  }, [pathCount, onPathCountChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImgFile(file);
    onFileSelect(file);
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
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed', borderColor: 'divider', borderRadius: 2,
            minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', cursor: 'pointer', mb: 3,
            transition: 'all 0.18s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(25,93,230,0.03)' },
            '&:active': { transform: 'scale(0.99)' },
          }}
        >
          <Stack alignItems='center' spacing={1.5} sx={{ p: 4 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: 'rgba(25,93,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloudUpload sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
            <Typography variant='body1' fontWeight={800} color='text.primary'>
              Upload a receipt photo
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5, maxWidth: 280 }}>
              Take a photo of any receipt from your store - then you'll mark where the receipt number is
            </Typography>
          </Stack>
        </Box>
        <input ref={fileInputRef} type='file' accept='image/*' hidden onChange={handleFileChange} />
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

      {/* Canvas */}
      <Box ref={canvasContainerRef} sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
        />
      </Box>

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

      <input ref={fileInputRef} type='file' accept='image/*' hidden onChange={handleFileChange} />

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
