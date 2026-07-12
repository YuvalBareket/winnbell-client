import {
  PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_20,
  BORDER_SUBTLE, BG_SUBTLE,
} from '../../../shared/colors';

// Refined premium TextField styling shared across AddLocationDialog and EditLocationModal.
export const locationFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: BG_SUBTLE,
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '& fieldset': {
      borderColor: BORDER_SUBTLE,
      transition: 'border-color 0.2s ease',
    },
    '&:hover': {
      bgcolor: '#ffffff',
      '& fieldset': { borderColor: ALPHA_PRIMARY_20 },
    },
    '&.Mui-focused': {
      bgcolor: '#ffffff',
      boxShadow: `0 0 0 4px ${ALPHA_PRIMARY_06}`,
      '& fieldset': { borderColor: PRIMARY_MAIN, borderWidth: 1.5 },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    '&.Mui-focused': { color: PRIMARY_MAIN, fontWeight: 700 },
  },
} as const;
