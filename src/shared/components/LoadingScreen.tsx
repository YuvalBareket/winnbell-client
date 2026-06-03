import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { GRADIENT_LOADING, BG_DEFAULT } from '../colors';

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
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Box
        component="img"
        src="/winnbell_app_name_white.svg"
        alt="Winnbell"
        sx={{ height: 52, width: 'auto' }}
      />
    </motion.div>

    <Box sx={{ display: 'flex', gap: 1.2, mt: 2 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: BG_DEFAULT,
            opacity: 0.5,
          }}
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
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
