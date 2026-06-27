import { useState } from 'react';
import { Box, Button, Stack, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { LinkOutlined, ContentCopyOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useReferralLink } from '../hooks/useReferralLink';
import { BORDER_LIGHT, SHADOW_CARD, PRIMARY_MAIN, TEXT_SECONDARY } from '../../../shared/colors';

const InviteFriendCard = () => {
  const { data: referralLink, isLoading } = useReferralLink();
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const handleCopyLink = async () => {
    if (!referralLink?.link) return;
    try {
      await navigator.clipboard.writeText(referralLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError('Failed to copy link');
    }
  };

  const handleWebShare = async () => {
    if (!referralLink?.link) return;
    if (!navigator.share) {
      handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: 'Join Winnbell',
        text: 'Get a free bonus entry when you join through my link.',
        url: referralLink.link,
      });
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name !== 'AbortError') {
        setShareError('Failed to share');
      }
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          border: `1px solid ${BORDER_LIGHT}`,
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
        }}
      >
        <CircularProgress size={34} thickness={4} />
      </Box>
    );
  }

  if (!referralLink) {
    return null;
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box
          sx={{
            p: 3,
            border: `1px solid ${BORDER_LIGHT}`,
            borderRadius: 3,
            bgcolor: 'white',
            boxShadow: SHADOW_CARD,
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: PRIMARY_MAIN,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <LinkOutlined sx={{ fontSize: 24 }} />
              </Box>
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                  Invite a friend
                </Typography>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem' }}>
                  They get a free bonus entry when they join through your link.
                </Typography>
              </Stack>
            </Stack>

            {/* Link display */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                border: `1px solid ${BORDER_LIGHT}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  color: TEXT_SECONDARY,
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0, // allow the flex item to shrink so ellipsis works (no overflow)
                }}
              >
                {referralLink.link}
              </Typography>
              <motion.div
                initial={false}
                animate={{
                  scale: copied ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Button
                  size="small"
                  variant="text"
                  onClick={handleCopyLink}
                  startIcon={copied ? <CheckCircleOutlined /> : <ContentCopyOutlined />}
                  sx={{
                    color: copied ? 'green' : PRIMARY_MAIN,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'rgba(21, 101, 192, 0.05)',
                    },
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </motion.div>
            </Box>

            {/* Share button */}
            <Button
              variant="outlined"
              fullWidth
              onClick={handleWebShare}
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
                py: 1.2,
                borderColor: PRIMARY_MAIN,
                color: PRIMARY_MAIN,
                '&:hover': {
                  bgcolor: 'rgba(21, 101, 192, 0.08)',
                  borderColor: PRIMARY_MAIN,
                },
              }}
            >
              Share link
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Toast notifications */}
      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontWeight: 600 }}>
          Link copied to clipboard
        </Alert>
      </Snackbar>

      <Snackbar open={!!shareError} autoHideDuration={3000} onClose={() => setShareError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" sx={{ fontWeight: 600 }}>
          {shareError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InviteFriendCard;
