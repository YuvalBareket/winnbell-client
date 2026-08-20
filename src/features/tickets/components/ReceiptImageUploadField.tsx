import { useState } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PhotoCameraOutlined, ImageOutlined, VisibilityOutlined, Close } from '@mui/icons-material';
import AttractButton from '../../../shared/components/AttractButton';
import {
  PRIMARY_MAIN, PRIMARY_LIGHT, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10,
  TEXT_SECONDARY, TEXT_TERTIARY, BORDER_LIGHT, BORDER_SUBTLE,
  SUCCESS_GREEN_TEXT_AA, SUCCESS_GREEN_DEEP,
} from '../../../shared/colors';
import { SPRING_SNAPPY } from '../../../shared/motion';

/** Photo-first upload block (design Turn 9). Three faces of one region:
    - prompt  (9a): the tall panel that IS the step - no fields exist yet.
    - reading (9b): the panel collapses into a progress row while we read the photo.
    - row     (9c): green "Receipt attached" row; tap replaces, eye previews. */
export type UploadFieldState = 'prompt' | 'reading' | 'row';

// One picker, no `capture` attr: mobile browsers then offer camera, photo library, AND
// files in one native sheet behind the single CTA - the camera is still one tap away,
// and a receipt already sitting in the gallery is never stranded.
export const SCAN_INPUT_ID = 'receipt-scan-input';

interface Props {
  state: UploadFieldState;
  receiptImageUrl: string | null;
  uploadError: string | null;
  onFile: (file: File) => void;
}

const ReceiptImageUploadField: React.FC<Props> = ({ state, receiptImageUrl, uploadError, onFile }) => {
  const reduceMotion = useReducedMotion();
  const [previewOpen, setPreviewOpen] = useState(false);

  const takeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Allow re-picking the same file after a replace.
    e.target.value = '';
    if (file) onFile(file);
  };

  const inputs = (
    <input id={SCAN_INPUT_ID} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={takeFile} />
  );

  // Receipt-shaped skeleton used while reading (the design deliberately shows the document
  // being read, not the photo itself - the photo is not the point yet, the reading is).
  const readingThumb = (
    <Box sx={{ position: 'relative', width: 52, height: 66, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper', border: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 }}>
      <Box sx={{ p: '8px 7px', display: 'flex', flexDirection: 'column', gap: '5px', height: '100%' }}>
        <Box sx={{ height: 4, width: '60%', borderRadius: '2px', bgcolor: 'grey.300' }} />
        <Box sx={{ height: 3, width: '100%', borderRadius: '1.5px', bgcolor: BORDER_SUBTLE }} />
        <Box sx={{ height: 3, width: '84%', borderRadius: '1.5px', bgcolor: BORDER_SUBTLE }} />
        <Box sx={{ height: 3, width: '92%', borderRadius: '1.5px', bgcolor: BORDER_SUBTLE }} />
        <Box sx={{ mt: 'auto', height: 5, width: '44%', borderRadius: '2px', bgcolor: 'text.primary' }} />
      </Box>
      {!reduceMotion && (
        <Box
          component={motion.div}
          animate={{ y: ['-16%', '116%'] }}
          transition={{ duration: 1.9, ease: [0.4, 0, 0.2, 1], repeat: Infinity }}
          sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: 22, background: `linear-gradient(180deg, transparent, ${alpha(PRIMARY_LIGHT, 0.45)} 52%, transparent)`, pointerEvents: 'none' }}
        />
      )}
    </Box>
  );

  return (
    <Box>
      {inputs}
      <AnimatePresence mode="wait" initial={false}>
        {state === 'prompt' && (
          <motion.div key="prompt" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING_SNAPPY}>
            <Box
              onDragOver={(e: React.DragEvent) => e.preventDefault()}
              onDrop={(e: React.DragEvent) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                // The `accept` attr does not filter drops - guard here so a dropped .exe/.txt
                // is ignored instead of failing slowly inside the image converter.
                if (!file) return;
                const ok = file.type.startsWith('image/') || file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
                if (ok) onFile(file);
              }}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                p: '28px 20px 20px', borderRadius: 2.5,
                border: `1.5px dashed ${alpha(PRIMARY_MAIN, 0.31)}`, bgcolor: ALPHA_PRIMARY_06,
              }}
            >
              <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhotoCameraOutlined sx={{ fontSize: 28, color: PRIMARY_MAIN }} />
              </Box>
              <Typography sx={{ mt: '14px', fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', color: 'text.primary' }}>
                Add your receipt
              </Typography>
              {/* TEXT_SECONDARY, not TEXT_TERTIARY: on the tinted panel the tertiary gray
                  composites below 4.5:1 (axe-verified). */}
              <Typography sx={{ mt: '5px', maxWidth: 262, fontSize: 13, lineHeight: 1.6, color: TEXT_SECONDARY }}>
                One photo is all we need. We read the details, then you check them.
              </Typography>

              {/* Mobile: camera-first CTA + library secondary. Desktop has no camera: one
                  chooser CTA and the panel doubles as a drop zone. */}
              <Box sx={{ mt: '18px', width: '100%' }}>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <AttractButton
                    fullWidth
                    variant="contained"
                    onClick={() => document.getElementById(SCAN_INPUT_ID)?.click()}
                    startIcon={<PhotoCameraOutlined />}
                    sx={{
                      height: 52, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem', textTransform: 'none',
                      bgcolor: PRIMARY_MAIN, boxShadow: `0 4px 20px ${PRIMARY_MAIN}45`,
                      '&:hover': { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.9)' },
                    }}
                  >
                    Take a photo
                  </AttractButton>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <AttractButton
                    fullWidth
                    variant="contained"
                    onClick={() => document.getElementById(SCAN_INPUT_ID)?.click()}
                    startIcon={<ImageOutlined />}
                    sx={{
                      height: 52, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem', textTransform: 'none',
                      bgcolor: PRIMARY_MAIN, boxShadow: `0 4px 20px ${PRIMARY_MAIN}45`,
                      '&:hover': { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.9)' },
                    }}
                  >
                    Choose a file
                  </AttractButton>
                </Box>
              </Box>
              <Typography sx={{ mt: 0.5, fontSize: 12, color: TEXT_SECONDARY, display: { xs: 'none', md: 'block' } }}>
                Or drop an image or PDF here.
              </Typography>
            </Box>

            {/* Privacy line: what the photo is for, and that nothing submits unseen. */}
            <Box sx={{ mt: '12px', display: 'flex', alignItems: 'flex-start', gap: 1, pl: '2px' }}>
              <Box component="svg" viewBox="0 0 24 24" sx={{ width: 15, height: 15, flexShrink: 0, mt: '1px', fill: SUCCESS_GREEN_TEXT_AA }}>
                <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9z" />
              </Box>
              <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: TEXT_TERTIARY }}>
                Used to verify this entry only. You see everything we read before it is submitted.
              </Typography>
            </Box>
          </motion.div>
        )}

        {state === 'reading' && (
          <motion.div key="reading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING_SNAPPY}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, p: 2, borderRadius: 2.5, bgcolor: 'background.paper', border: `1.5px solid ${BORDER_LIGHT}` }}>
              {readingThumb}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>Reading your receipt</Typography>
               
                </Box>
                <Typography sx={{ mt: '2px', fontSize: 12, color: TEXT_TERTIARY }}>This takes a few seconds</Typography>
              </Box>
            </Box>
          </motion.div>
        )}

        {state === 'row' && (
          <motion.div key="row" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={SPRING_SNAPPY}>
            <Box
              component="label"
              htmlFor={SCAN_INPUT_ID}
              tabIndex={0}
              role="button"
              aria-label="Receipt attached - replace the photo"
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById(SCAN_INPUT_ID)?.click();
                }
              }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.75, p: 2, borderRadius: 2.5, cursor: 'pointer',
                bgcolor: alpha(SUCCESS_GREEN_TEXT_AA, 0.05),
                border: `1.5px dashed ${SUCCESS_GREEN_TEXT_AA}`,
                '&:focus-visible': { outline: `2px solid ${PRIMARY_MAIN}`, outlineOffset: 2 },
              }}
            >
              {receiptImageUrl && (
                <Box sx={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: `2px solid ${SUCCESS_GREEN_TEXT_AA}`, bgcolor: 'background.paper' }}>
                  <Box component="img" src={receiptImageUrl} alt="Receipt" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: SUCCESS_GREEN_DEEP }}>Receipt attached</Typography>
                <Typography sx={{ mt: '1px', fontSize: 12, color: SUCCESS_GREEN_TEXT_AA, display: { xs: 'block', md: 'none' } }}>Tap to replace</Typography>
                <Typography sx={{ mt: '1px', fontSize: 12, color: SUCCESS_GREEN_TEXT_AA, display: { xs: 'none', md: 'block' } }}>Click to replace</Typography>
              </Box>
              <IconButton
                aria-label="View photo"
                onClick={(e) => {
                  // The row is a label for the picker; the eye must not also open it.
                  e.preventDefault();
                  e.stopPropagation();
                  setPreviewOpen(true);
                }}
                sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: alpha(SUCCESS_GREEN_TEXT_AA, 0.12), color: SUCCESS_GREEN_DEEP, flexShrink: 0, '&:hover': { bgcolor: alpha(SUCCESS_GREEN_TEXT_AA, 0.2) } }}
              >
                <VisibilityOutlined sx={{ fontSize: 19 }} />
              </IconButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block', pl: 0.5 }}>
          {uploadError}
        </Typography>
      )}

      {/* Full-size photo preview (eye button). */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ position: 'relative', bgcolor: 'common.white' }}>
          <IconButton
            aria-label="Close preview"
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'background.paper' } }}
          >
            <Close fontSize="small" />
          </IconButton>
          {receiptImageUrl && (
            <Box component="img" src={receiptImageUrl} alt="Receipt" sx={{ display: 'block', width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default ReceiptImageUploadField;
