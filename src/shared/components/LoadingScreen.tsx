import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { GRADIENT_LOADING, ALPHA_WHITE_15, BG_DEFAULT } from '../colors';

const LoadingScreen = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      background: GRADIENT_LOADING,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden',
    }}
  >
    {/* Soft glow behind the mark for depth */}
    <Box
      sx={{
        position: 'absolute',
        width: 380,
        height: 380,
        borderRadius: '50%',
        bgcolor: ALPHA_WHITE_15,
        filter: 'blur(100px)',
        pointerEvents: 'none',
      }}
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ position: 'relative' }}
    >
      <Box
        component="img"
        src="/winnbell_app_name_white.svg"
        alt="Winnbell"
        sx={{ height: 52, width: 'auto' }}
      />
    </motion.div>

    <Box sx={{ display: 'flex', gap: 1.2, mt: 3, position: 'relative' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: BG_DEFAULT,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </Box>
  </Box>
);

export default LoadingScreen;
