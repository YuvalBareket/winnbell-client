import { Box, Typography, Stack } from '@mui/material';
import { Check } from '@mui/icons-material';

export const STEPS = [
  { num: 1, label: 'Threshold' },
  { num: 2, label: 'Guide Image' },
  { num: 3, label: 'Plan' },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <Stack direction='row' alignItems='center' sx={{ mb: 4 }}>
    {STEPS.map((s, idx) => (
      <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
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
          <Box sx={{ flex: 1, height: 1, mx: 1.5, bgcolor: s.num < currentStep ? 'primary.main' : 'divider', transition: 'background-color 0.2s' }} />
        )}
      </Box>
    ))}
  </Stack>
);

export default StepIndicator;
