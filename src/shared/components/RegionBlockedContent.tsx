import { Typography, Stack, Paper, Link, useTheme } from '@mui/material';
import { PublicOutlined, Instagram } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { staggerContainer, popIn, riseIn } from '../motion';

const INSTAGRAM_URL = 'https://www.instagram.com/winnbell_official/';

/**
 * The "not available in your region" message. Shared between the standalone
 * /region-blocked page (signup gate redirect) and RegionGate's inline mode,
 * which swaps it in place of a gated page's content (e.g. /scan).
 */
const RegionBlockedContent = () => {
  const theme = useTheme();

  return (
    <Stack
      component={motion.div}
      variants={staggerContainer}
      initial='hidden'
      animate='visible'
      spacing={4}
      alignItems='center'
      textAlign='center'
    >
      {/* Globe icon in colored paper */}
      <motion.div variants={popIn}>
        <Paper elevation={4} sx={{ width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PublicOutlined sx={{ color: 'white', fontSize: 44 }} />
        </Paper>
      </motion.div>

      {/* Heading */}
      <motion.div variants={riseIn}>
        <Typography variant='h4' sx={{ fontWeight: 700 }}>
          Not Available Yet
        </Typography>
      </motion.div>

      {/* Subtext */}
      <motion.div variants={riseIn}>
        <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 380 }}>
          Winnbell isn't available in your region yet. We're expanding soon - we'll be with you before you know it.
        </Typography>
      </motion.div>

      {/* Instagram follow prompt */}
      <motion.div variants={riseIn}>
        <Link
          href={INSTAGRAM_URL}
          target='_blank'
          rel='noopener noreferrer'
          underline='none'
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            color: 'primary.main', fontWeight: 700, fontSize: '0.95rem',
            '&:hover': { textDecoration: 'underline' },
            '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 4, borderRadius: '4px' },
          }}
        >
          <Instagram sx={{ fontSize: 20 }} />
          Stay tuned on our Instagram for updates
        </Link>
      </motion.div>
    </Stack>
  );
};

export default RegionBlockedContent;
