import { Fragment } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Check } from '@mui/icons-material';
import {
  PRIMARY_MAIN,
  TEXT_PRIMARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
  STATUS_ACTIVATED_TEXT,
} from '../../../../shared/colors';

const STEPS = [
  { num: 1, label: 'Threshold', short: 'Threshold' },
  { num: 2, label: 'Guide Image', short: 'Guide' },
  { num: 3, label: 'Plan', short: 'Plan' },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  return (
    <Box>
      {/* Mobile pill stepper - each step is a circle with its label underneath */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', justifyContent: 'space-between' }}>
        {STEPS.map((s, idx) => {
          const done = s.num < currentStep;
          const active = s.num === currentStep;
          return (
            <Fragment key={s.num}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.625, flex: 1 }}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                    bgcolor: done ? STATUS_ACTIVATED_TEXT : active ? PRIMARY_MAIN : '#eef2f7',
                    color: done || active ? 'white' : TEXT_TERTIARY,
                    boxShadow: active ? '0 4px 10px -3px rgba(21,101,192,.5)' : 'none',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {done ? <Check sx={{ fontSize: 15 }} /> : s.num}
                </Box>
                <Typography sx={{ fontSize: '10.5px', fontWeight: active ? 700 : 600, color: active ? TEXT_PRIMARY : TEXT_TERTIARY }}>
                  {s.short}
                </Typography>
              </Box>
              {idx < STEPS.length - 1 && (
                <Box sx={{ height: 2, flex: '0 0 26px', borderRadius: 1, mb: '16px', bgcolor: s.num < currentStep ? PRIMARY_MAIN : BORDER_SUBTLE }} />
              )}
            </Fragment>
          );
        })}
      </Box>

      {/* Full layout with all labels - hidden on xs, visible on sm+ */}
      <Stack
        direction='row'
        alignItems='center'
        sx={{
          display: { xs: 'none', sm: 'flex' },
          gap: 0,
        }}
      >
        {STEPS.map((s, idx) => (
          <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
            {/* Step circle + label */}
            <Stack direction='row' alignItems='center' spacing={0.875} sx={{ flexShrink: 0 }}>
              {/* Circle */}
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  flexShrink: 0,
                  bgcolor: s.num < currentStep ? STATUS_ACTIVATED_TEXT : s.num === currentStep ? PRIMARY_MAIN : '#eef2f7',
                  color: s.num === currentStep ? 'white' : s.num < currentStep ? 'white' : TEXT_TERTIARY,
                  transition: 'background-color 0.2s',
                }}
              >
                {s.num < currentStep ? <Check sx={{ fontSize: 11 }} /> : s.num}
              </Box>
              {/* Label */}
              <Typography
                sx={{
                  fontSize: '12.5px',
                  fontWeight: s.num === currentStep ? 800 : 700,
                  color: s.num === currentStep ? TEXT_PRIMARY : s.num < currentStep ? TEXT_PRIMARY : TEXT_TERTIARY,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, font-weight 0.2s',
                }}
              >
                {s.label}
              </Typography>
            </Stack>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  mx: 1.875,
                  bgcolor: s.num < currentStep ? PRIMARY_MAIN : BORDER_SUBTLE,
                  transition: 'background-color 0.2s',
                  borderRadius: 1,
                  minWidth: 60,
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
