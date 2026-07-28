import { useState } from 'react';
import {
  Box, Button, CircularProgress, IconButton, MenuItem, Stack, TextField, Typography,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  ArrowBackIosNew, Send, MailOutline, Person, CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import AuthBrandPanel from '../../auth/components/AuthBrandPanel';
import { authLabelSx, authInputSx, authCtaSx } from '../../auth/components/authStyles';
import { api } from '../../../shared/api/client';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import { staggerContainer, riseIn, popIn } from '../../../shared/motion';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, ALPHA_WHITE_70,
  TEXT_HEADING, TEXT_TERTIARY, BORDER_LIGHT, SUCCESS_GREEN, ALPHA_GREEN_10,
} from '../../../shared/colors';

// Must match CONTACT_TOPICS on the server exactly.
const TOPICS = ['Account & draws', 'Receipts & entries', 'Business partnership', 'Something else'];

const SUPPORT_EMAIL = 'support@winnbell.com';

const ContactPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const user = useAppSelector(selectCurrentUser);

  // Prefill for signed-in members; logged-out visitors start blank.
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  // Honeypot: a hidden field real users never touch. The server fake-accepts (200, no email) when
  // it arrives non-empty, so a bot that autofills every field silently traps itself.
  const [website, setWebsite] = useState('');

  const handleSend = async () => {
    setError('');
    if (!fullName.trim()) { setError('Please enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!message.trim()) { setError('Please write a message.'); return; }

    setSending(true);
    try {
      await api.post('/contact', {
        fullName: fullName.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        website, // honeypot (empty for real users)
      });
      setSent(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'We could not send your message right now. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  // Email-us chip (gradient surfaces) - shown on the brand panel area on both layouts.
  const emailChip = (
    <Stack
      direction='row'
      alignItems='center'
      spacing={1.5}
      sx={{
        bgcolor: ALPHA_WHITE_15,
        border: `1px solid ${ALPHA_WHITE_20}`,
        borderRadius: '14px',
        px: 2, py: 1.25,
        width: 'fit-content',
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: ALPHA_WHITE_20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <MailOutline sx={{ fontSize: 18, color: 'white' }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: ALPHA_WHITE_70, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>
          Email us
        </Typography>
        <Typography component='a' href={`mailto:${SUPPORT_EMAIL}`} sx={{ fontSize: '13.5px', fontWeight: 700, color: 'white', textDecoration: 'none', display: 'block' }}>
          {SUPPORT_EMAIL}
        </Typography>
      </Box>
    </Stack>
  );

  // Success card replaces the form once the message is on its way.
  const successCard = (
    <motion.div variants={popIn} initial='hidden' animate='visible'>
      <Stack alignItems='center' spacing={2} sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: ALPHA_GREEN_10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle sx={{ fontSize: 40, color: SUCCESS_GREEN }} />
        </Box>
        <Typography sx={{ fontSize: '22px', fontWeight: 800, color: TEXT_HEADING, letterSpacing: '-0.02em' }}>
          Message sent
        </Typography>
        <Typography sx={{ fontSize: '14.5px', color: TEXT_TERTIARY, maxWidth: 320, lineHeight: 1.6 }}>
          Thanks for reaching out. Our team will get back to you at {email.trim()}.
        </Typography>
        <Button variant='contained' onClick={() => navigate('/')} sx={{ ...authCtaSx, width: 'auto', px: 4, mt: 1 }}>
          Back to Winnbell
        </Button>
      </Stack>
    </motion.div>
  );

  const form = (
    <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
      <Stack spacing={2.25}>
        {/* Honeypot: off-screen, not tabbable, not announced to AT. Real users never fill it; bots do. */}
        <input
          type='text'
          name='website'
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete='off'
          aria-hidden='true'
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />
        {error && (
          <motion.div variants={riseIn}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'error.main' }}>{error}</Typography>
          </motion.div>
        )}

        {/* Name + email share a row on desktop, stack on mobile */}
        <motion.div variants={riseIn}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2.25 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={authLabelSx}>Full name</Typography>
              <TextField
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='Your name'
                disabled={sending}
                slotProps={{
                  htmlInput: { maxLength: 100 },
                  input: { startAdornment: <Person sx={{ fontSize: 18, color: TEXT_TERTIARY, mr: 1 }} /> },
                }}
                sx={authInputSx}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={authLabelSx}>Email</Typography>
              <TextField
                fullWidth
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                disabled={sending}
                slotProps={{
                  htmlInput: { maxLength: 255 },
                  input: { startAdornment: <MailOutline sx={{ fontSize: 18, color: TEXT_TERTIARY, mr: 1 }} /> },
                }}
                sx={authInputSx}
              />
            </Box>
          </Box>
        </motion.div>

        <motion.div variants={riseIn}>
          <Typography sx={authLabelSx}>Topic</Typography>
          <TextField
            fullWidth
            select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={sending}
            sx={authInputSx}
          >
            {TOPICS.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </motion.div>

        <motion.div variants={riseIn}>
          <Typography sx={authLabelSx}>Message</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Tell us how we can help...'
            disabled={sending}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            sx={authInputSx}
          />
        </motion.div>

        <motion.div variants={riseIn}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleSend}
            disabled={sending}
            endIcon={sending ? undefined : <Send sx={{ fontSize: 17 }} />}
            sx={authCtaSx}
          >
            {sending ? <CircularProgress size={24} color='inherit' /> : 'Send message'}
          </Button>
        </motion.div>
      </Stack>
    </motion.div>
  );

  // ─── Desktop: split screen (brand panel + form panel), matching the auth pages ───
  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', height: 'var(--dvh100, 100dvh)', overflow: 'hidden' }}>
        <AuthBrandPanel
          headline={<>Let&apos;s talk.</>}
          tagline='Questions about a draw, your account, or partnering with us? Send us a message and our team will take a look.'
          bullets={[]}
          footer={emailChip}
        />

        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: BG_PAGE, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 7, py: 6 }}>
          <Box sx={{ maxWidth: 440, width: '100%', mx: 'auto' }}>
            {sent ? successCard : (
              <>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Stack direction='row' alignItems='center' gap={2} sx={{ mb: 0.5 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}>
                      <ArrowBackIosNew fontSize='small' />
                    </IconButton>
                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', color: TEXT_HEADING }}>
                      Send us a message
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: TEXT_TERTIARY, fontSize: '14.5px', mb: 3.5 }}>
                    Fill in the form and send it our way.
                  </Typography>
                </motion.div>
                {form}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── Mobile: gradient band (auth-page pattern) + form ───────────────────────
  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column', bgcolor: BG_PAGE }}>
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 28px 28px',
          px: 1.5,
          pt: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          pb: 2.5,
          flexShrink: 0,
        }}
      >
        {/* Glow orb: radial gradient, not filter:blur (Android clipping) */}
        <Box sx={{ position: 'absolute', top: -110, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

        {/* Brand row: back arrow + app name, same row (app rule) */}
        <Stack direction='row' alignItems='center' spacing={1.25} sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              width: 40, height: 40, color: 'white', bgcolor: ALPHA_WHITE_15,
              border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '10px', flexShrink: 0,
              '&:hover': { bgcolor: ALPHA_WHITE_30 },
            }}
          >
            <ArrowBackIosNew sx={{ fontSize: 18 }} />
          </IconButton>
          <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </Stack>

        {/* Title block */}
        <Box sx={{ position: 'relative', mt: 1.5, px: 1 }}>
          <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
            Contact us
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.25 }}>
            Send us a message.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, px: 2.5, py: 3 }}>
        <Box sx={{ maxWidth: 440, mx: 'auto' }}>
          {sent ? successCard : form}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactPage;
