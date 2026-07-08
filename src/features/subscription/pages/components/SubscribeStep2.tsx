import { useRef, useState } from 'react';
import { Box, Button, Typography, Stack, CircularProgress, IconButton } from '@mui/material';
import { UndoOutlined, DeleteOutlineOutlined, PhotoCameraOutlined, ArrowBack } from '@mui/icons-material';
import CanvasAnnotationEditor, { type CanvasEditorHandle } from '../../../../shared/components/CanvasAnnotationEditor';
import {
  PRIMARY_MAIN,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TEXT_HEADING,
  BORDER_SUBTLE,
  GRADIENT_PRIMARY,
} from '../../../../shared/colors';

interface Props {
  imgFile: File | null;
  setImgFile: (f: File | null) => void;
  isSaving: boolean;
  onSave: (blob: Blob) => void;
  onSkip: () => void;
  onBack?: () => void;
}

const SubscribeStep2 = ({
  imgFile,
  setImgFile,
  isSaving,
  onSave,
  onSkip,
  onBack,
}: Props) => {
  const editorRef = useRef<CanvasEditorHandle>(null);
  const [pathCount, setPathCount] = useState(0);
  const hasImage = !!imgFile;

  const toolBtnSx = {
    flex: 1,
    fontSize: '12px',
    fontWeight: 700,
    borderRadius: '11px',
    py: 1,
    textTransform: 'none' as const,
    whiteSpace: 'nowrap' as const,
    color: TEXT_SECONDARY,
    borderColor: BORDER_SUBTLE,
    backgroundColor: '#fff',
    '& .MuiButton-startIcon': { mr: 0.5 },
    '&:hover': { backgroundColor: '#fff', borderColor: PRIMARY_MAIN },
  };

  return (
    <Box sx={{ px: { xs: 0, md: 4 }, pt: { xs: 0.5, md: 4 }, pb: { xs: 2, md: 4 } }}>
      {/* Heading + subtitle */}
      <Stack direction='row' alignItems='center' spacing={0.5} sx={{ mb: 0.5 }}>
        {onBack && (
          <IconButton onClick={onBack} size='small' aria-label='Back' sx={{ ml: -0.75, color: TEXT_SECONDARY }}>
            <ArrowBack sx={{ fontSize: 22 }} />
          </IconButton>
        )}
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: TEXT_HEADING,
          }}
        >
          Make it crystal clear
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: '13.5px',
          color: TEXT_TERTIARY,
          fontWeight: 500,
          mb: 4,
        }}
      >
        Upload a receipt from your store and circle exactly where customers find the number they enter.
      </Typography>

      {/* Canvas editor + controls.
          Mobile order: How-to card, image, then the action controls. Desktop: image
          on the left, How-to + controls stacked on the right. */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
              gridTemplateAreas: {
                xs: '"howto" "image" "controls"',
                md: '"image howto" "image controls"',
              },
              // Desktop: How-to row hugs its content, controls row takes the remaining
              // height so any extra space sits below the buttons, not between the cards.
              gridTemplateRows: { md: 'auto 1fr' },
              gap: { xs: 2, md: 3.5 },
              alignItems: 'start',
            }}
          >
            {/* Canvas editor in frame */}
            <Box
              sx={{
                gridArea: 'image',
                backgroundColor: '#fff',
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: 2,
                padding: 4,
                minHeight: { xs: 300, md: 420 },
                boxShadow: '0 6px 20px -8px rgba(15,39,71,.18)',
              }}
            >
              <CanvasAnnotationEditor
                ref={editorRef}
                hideSaveButton
                hideInstruction
                hideToolbar
                onPathCountChange={setPathCount}
                imgFile={imgFile}
                onFileSelect={(file) => setImgFile(file)}
                onSave={onSave}
                isSaving={isSaving}
              />
            </Box>

            {/* "How to mark it" card - above the image on mobile, top-right on desktop */}
            <Box
              sx={{
                gridArea: 'howto',
                backgroundColor: '#fff',
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: 2,
                padding: 2.5,
                boxShadow: '0 6px 20px -8px rgba(15,39,71,.18)',
              }}
            >
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: TEXT_HEADING,
                    mb: 1.75,
                  }}
                >
                  How to mark it
                </Typography>
                <Stack spacing={1.625} sx={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    'Upload a real receipt from your store.',
                    'Circle the receipt\'s unique number they enter.',
                    'Save · this becomes the in-app guide.',
                  ].map((text, idx) => (
                    <Stack
                      key={idx}
                      direction='row'
                      spacing={1.375}
                      sx={{ display: 'flex', alignItems: 'flex-start' }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(21,101,192,0.06)',
                          color: PRIMARY_MAIN,
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '12.5px',
                          color: TEXT_SECONDARY,
                          lineHeight: 1.5,
                        }}
                      >
                        {text}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
            </Box>

            {/* Controls - below the image on mobile, bottom-right on desktop */}
            <Stack spacing={1.75} sx={{ gridArea: 'controls' }}>
              {/* Save & continue - the single save action; drives the canvas editor via ref */}
              {hasImage && (
                <Button
                  fullWidth
                  variant='contained'
                  onClick={() => editorRef.current?.save()}
                  disabled={isSaving}
                  sx={{
                    background: GRADIENT_PRIMARY,
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 800,
                    borderRadius: '13px',
                    padding: '15px',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(21,101,192,.3)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(21,101,192,.4)',
                    },
                  }}
                >
                  {isSaving ? <CircularProgress size={20} color='inherit' /> : 'Save & continue'}
                </Button>
              )}

              {/* Annotation controls - Undo / Clear / New photo (drive the editor via ref) */}
              {hasImage && (
                <Stack direction='row' spacing={1}>
                  <Button fullWidth variant='outlined' startIcon={<UndoOutlined sx={{ fontSize: 16 }} />}
                    disabled={pathCount === 0} onClick={() => editorRef.current?.undo()} sx={toolBtnSx}>
                    Undo
                  </Button>
                  <Button fullWidth variant='outlined' startIcon={<DeleteOutlineOutlined sx={{ fontSize: 16 }} />}
                    disabled={pathCount === 0} onClick={() => editorRef.current?.clear()} sx={toolBtnSx}>
                    Clear
                  </Button>
                  <Button fullWidth variant='outlined' startIcon={<PhotoCameraOutlined sx={{ fontSize: 16 }} />}
                    onClick={() => editorRef.current?.newPhoto()} sx={toolBtnSx}>
                    New photo
                  </Button>
                </Stack>
              )}

              {/* Skip for now - always available */}
              <Typography
                onClick={onSkip}
                sx={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: TEXT_TERTIARY,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mt: 0.5,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Skip for now
              </Typography>
            </Stack>
          </Box>
    </Box>
  );
};

export default SubscribeStep2;
