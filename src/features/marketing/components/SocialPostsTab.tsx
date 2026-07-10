import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress, useMediaQuery, useTheme,
} from '@mui/material';
import { FileDownload, ContentCopy } from '@mui/icons-material';
import {
  GRADIENT_POST_NAVY, GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_80,
  PRIMARY_MAIN,
} from '../../../shared/colors';
import { ReadyToShare } from './ShareCards';
import { downloadNodeAsPng } from '../utils/capture';

interface SocialPostsTabProps {
  businessName: string;
  locationLabel: string;
  scanUrl: string;
  prizeLabel: string | null;
  canDownload: boolean;
  onRequireLocation: () => void;
  onToast: (msg: string) => void;
}

const STORY_W = 440;
const STORY_H = 780;

const SocialPostsTab = ({
  businessName,
  locationLabel,
  scanUrl,
  prizeLabel,
  canDownload,
  onRequireLocation,
  onToast,
}: SocialPostsTabProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [savingStory, setSavingStory] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  // Preview scale: the story master is 440x780; keep the preview compact (about the same
  // height as the gallery tiles below) so the card doesn't tower over the page.
  const previewScale = isMobile ? 0.48 : 0.55;

  const handleSaveStory = async () => {
    if (!canDownload) { onRequireLocation(); return; }
    setSavingStory(true);
    try {
      if (storyRef.current) {
        await downloadNodeAsPng(storyRef.current, 'winnbell-story.png', 2);
        onToast('Story image downloaded!');
      }
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setSavingStory(false);
    }
  };

  const handleCopyLink = () => {
    if (!canDownload) { onRequireLocation(); return; }
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={800} gutterBottom>Story with a link sticker</Typography>
              <Typography variant='body2' color='text.secondary'>Premium story design. Save and add a link sticker in Instagram.</Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
              {/* Story Preview - scaled so it never overflows a phone; the hidden full-size
                  master below is what actually gets captured for the download. */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: STORY_W * previewScale,
                    height: STORY_H * previewScale,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                  }}
                >
                <Box
                  ref={storyRef}
                  sx={{
                    width: STORY_W,
                    height: STORY_H,
                    background: GRADIENT_POST_NAVY,
                    color: '#fff',
                    p: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: -120, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD_TROPHY}2e 0%, ${GOLD_TROPHY}10 45%, transparent 70%)` }} />

                  {/* Header */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 24, display: 'block', mb: 2 }} />
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '999px', px: 2, py: 1 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />
                      <Typography sx={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>
                        Shop local. Free to enter.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Main Message */}
                  <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: 48, lineHeight: 1.1, letterSpacing: '-0.02em', mb: 2 }}>
                      Something to look forward to, every visit.
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: 20, color: ACCENT_GOLD_LIGHT }}>
                      Join this month's draw at {businessName}
                    </Typography>
                  </Box>

                  {/* Footer */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography sx={{ color: ALPHA_WHITE_80, fontSize: 12, fontWeight: 600, mb: 1 }}>
                      No purchase necessary
                    </Typography>
                  </Box>
                </Box>
                </Box>
              </Box>

              {/* How-to + Buttons */}
              <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>How to use</Typography>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant='caption' fontWeight={700} display='block' sx={{ mb: 0.25 }}>1. Save the image</Typography>
                          <Typography variant='caption' color='text.secondary'>Download this story to your phone.</Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' fontWeight={700} display='block' sx={{ mb: 0.25 }}>2. Copy your link</Typography>
                          <Typography variant='caption' color='text.secondary'>Copy your Winnbell scan link below.</Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' fontWeight={700} display='block' sx={{ mb: 0.25 }}>3. Add link sticker</Typography>
                          <Typography variant='caption' color='text.secondary'>In Instagram, add a link sticker and paste it.</Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Stack spacing={1.5}>
                      <Button
                        fullWidth
                        variant='contained'
                        size='small'
                        startIcon={savingStory ? <CircularProgress size={16} color='inherit' /> : <FileDownload sx={{ fontSize: 16 }} />}
                        onClick={handleSaveStory}
                        disabled={savingStory}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        {savingStory ? 'Saving...' : 'Save story image'}
                      </Button>

                      <Button
                        fullWidth
                        variant='outlined'
                        size='small'
                        startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                        onClick={handleCopyLink}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          borderColor: copiedLink ? 'success.main' : 'divider',
                          color: copiedLink ? 'success.main' : 'text.primary',
                        }}
                      >
                        {copiedLink ? 'Copied!' : 'Copy your link'}
                      </Button>
                    </Stack>

                    {!canDownload && (
                      <Typography variant='caption' sx={{ color: PRIMARY_MAIN, fontWeight: 700 }}>
                        Choose a location above to enable.
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <ReadyToShare
          businessName={businessName}
          locationLabel={locationLabel}
          prizeLabel={prizeLabel}
          canDownload={canDownload}
          onRequireLocation={onRequireLocation}
          onToast={onToast}
        />
      </Box>
    </motion.div>
  );
};

export default SocialPostsTab;
