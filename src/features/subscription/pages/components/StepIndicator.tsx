import { Box, Typography, Stack } from '@mui/material';
import { Check } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

export const STEPS = [
  { num: 1, label: 'Threshold' },
  { num: 2, label: 'Guide Image' },
  { num: 3, label: 'Plan' },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const currentStepLabel = STEPS.find(s => s.num === currentStep)?.label ?? '';

  return (
    <Box sx={{ mb: 4 }}>
      {/* Compact step circles and connectors - visible on xs, hidden on sm+ */}
      <Stack
        direction='row'
        alignItems='center'
        sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {STEPS.map((s, idx) => (
          <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.72rem',
                fontWeight: 800,
                flexShrink: 0,
                bgcolor: s.num <= currentStep ? 'primary.main' : 'action.hover',
                color: s.num <= currentStep ? 'white' : 'text.disabled',
                transition: 'background-color 0.2s',
              }}
            >
              {s.num < currentStep ? <Check sx={{ fontSize: 13 }} /> : s.num}
            </Box>
            {idx < STEPS.length - 1 && (
              <Box
                sx={{
                  width: 20,
                  height: 2,
                  bgcolor: s.num < currentStep ? 'primary.main' : 'divider',
                  transition: 'background-color 0.2s',
                }}
              />
            )}
          </Box>
        ))}
      </Stack>

      {/* Active step label centered below circles on xs */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          style={{ textAlign: 'center', marginTop: 8 }}
        >
          <Typography
            variant='caption'
            sx={{
              display: { xs: 'block', sm: 'none' },
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {currentStepLabel}
          </Typography>
        </motion.div>
      </AnimatePresence>

      {/* Full layout with all labels - hidden on xs, visible on sm+ */}
      <Stack
        direction='row'
        alignItems='center'
        sx={{
          display: { xs: 'none', sm: 'flex' },
        }}
      >
        {STEPS.map((s, idx) => (
          <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  bgcolor: s.num <= currentStep ? 'primary.main' : 'action.hover',
                  color: s.num <= currentStep ? 'white' : 'text.disabled',
                  transition: 'background-color 0.2s',
                }}
              >
                {s.num < currentStep ? <Check sx={{ fontSize: 13 }} /> : s.num}
              </Box>
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 700,
                  color: s.num === currentStep ? 'text.primary' : 'text.disabled',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </Typography>
            </Stack>
            {idx < STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  mx: 1.5,
                  bgcolor: s.num < currentStep ? 'primary.main' : 'divider',
                  transition: 'background-color 0.2s',
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default StepIndicator;
