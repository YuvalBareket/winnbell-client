import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, Box, Typography, Button, Checkbox, FormControlLabel, Link, Stack,
} from '@mui/material';
import {
  VerifiedRounded, CheckCircleRounded, FileDownloadOutlined, ArrowForwardRounded,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { popIn } from '../../../shared/motion';
import {
  GRADIENT_HERO, PRIMARY_MAIN, PRIMARY_TINT, BG_SURFACE,
  TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT,
} from '../../../shared/colors';

interface GuidelinesAgreementDialogProps {
  open: boolean;
  onClose: () => void;
  /** Confirmed: proceed with the download. dontShowAgain = the checkbox state at confirm time. */
  onAgree: (dontShowAgain: boolean) => void;
}

// Shown before a Brand Kit download so the business acknowledges the brand/usage guidelines while
// creating their own materials. The parent persists the "don't show again" choice.
const GuidelinesAgreementDialog = ({ open, onClose, onAgree }: GuidelinesAgreementDialogProps) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  // MUI Dialog unmounts its content when closed (default), so this resets to false on reopen.

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: '26px', overflow: 'hidden', bgcolor: BG_SURFACE } }}
    >
      <motion.div variants={popIn} initial='hidden' animate='visible'>
        {/* Gradient hero header with a frosted medallion */}
        <Box
          sx={{
            background: GRADIENT_HERO,
            px: 3,
            pt: 3.5,
            pb: 5,
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          {/* soft glow orb, top-right */}
          <Box
            sx={{
              position: 'absolute', top: -90, right: -70, width: 240, height: 240, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'relative', zIndex: 1, width: 66, height: 66, mx: 'auto',
              borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.35)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <VerifiedRounded sx={{ fontSize: 34, color: '#fff' }} />
          </Box>
        </Box>

        {/* White body, pulled up over the header for a layered card feel */}
        <Box
          sx={{
            bgcolor: BG_SURFACE, borderRadius: '24px 24px 0 0', mt: '-22px',
            position: 'relative', zIndex: 2, px: 3, pt: 3, pb: 2.75,
          }}
        >
          <Stack spacing={2.25}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: '1.28rem', color: TEXT_HEADING, letterSpacing: '-0.01em', mb: 0.5 }}>
                Before you download
              </Typography>
              <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
                A quick agreement before you use the brand kit.
              </Typography>
            </Box>

            {/* The agreement itself, in a tinted callout */}
            <Box
              sx={{
                display: 'flex', gap: 1.25, alignItems: 'flex-start',
                bgcolor: PRIMARY_TINT, border: `1px solid ${BORDER_LIGHT}`, borderRadius: '14px', p: 1.75,
              }}
            >
              <CheckCircleRounded sx={{ fontSize: 20, color: PRIMARY_MAIN, flexShrink: 0, mt: '1px' }} />
              <Typography variant='body2' sx={{ color: TEXT_HEADING, fontWeight: 600, lineHeight: 1.55 }}>
                I agree to follow the business guidelines while creating my own marketing materials.
              </Typography>
            </Box>

            <Link
              component='button'
              type='button'
              onClick={() => { onClose(); navigate('/business-guidelines'); }}
              sx={{
                alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 0.5,
                fontSize: '0.85rem', fontWeight: 700, color: PRIMARY_MAIN, textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Read the business guidelines
              <ArrowForwardRounded sx={{ fontSize: 15 }} />
            </Link>

            <FormControlLabel
              control={(
                <Checkbox
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  size='small'
                  sx={{ color: TEXT_SECONDARY, '&.Mui-checked': { color: PRIMARY_MAIN } }}
                />
              )}
              label={<Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>Do not show this again</Typography>}
              sx={{ alignSelf: 'center', mx: 0 }}
            />

            <Button
              fullWidth
              onClick={() => onAgree(dontShowAgain)}
              endIcon={<FileDownloadOutlined />}
              sx={{
                textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', borderRadius: '13px', py: 1.35,
                color: '#fff', whiteSpace: 'nowrap',
                background: GRADIENT_HERO, boxShadow: '0 8px 20px rgba(21,101,192,0.28)',
                '&:hover': { boxShadow: '0 12px 26px rgba(21,101,192,0.38)' },
              }}
            >
              I agree and download
            </Button>
          </Stack>
        </Box>
      </motion.div>
    </Dialog>
  );
};

export default GuidelinesAgreementDialog;
