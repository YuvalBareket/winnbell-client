// Shared visual language for the redesigned auth forms (login / register / profile setup),
// taken from the approved design: label above the field, white rounded-12 input with a muted
// leading icon and a primary focus ring; deep-blue gradient CTA; subtle bordered Google button.
import type { SxProps, Theme } from '@mui/material';
import {
  BORDER_LIGHT, PRIMARY_MAIN, ALPHA_PRIMARY_10, TEXT_SECONDARY, TEXT_HEADING,
  GRADIENT_CTA, SHADOW_PRIMARY_MEDIUM, SHADOW_NEUTRAL_SOFT,
} from '../../../shared/colors';

export const authLabelSx: SxProps<Theme> = {
  fontSize: '12.5px',
  fontWeight: 700,
  color: TEXT_SECONDARY,
  mb: '7px',
};

export const authInputSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    borderRadius: '12px',
    fontSize: '14.5px',
    fontWeight: 600,
    color: TEXT_HEADING,
    '& fieldset': { borderColor: BORDER_LIGHT, borderWidth: '1px' },
    '&:hover fieldset': { borderColor: BORDER_LIGHT },
    '&.Mui-focused fieldset': { borderColor: PRIMARY_MAIN, borderWidth: '1.5px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
  },
};

export const authCtaSx: SxProps<Theme> = {
  borderRadius: '13px',
  py: '14px',
  fontSize: '15px',
  fontWeight: 800,
  color: 'white',
  textTransform: 'none',
  background: GRADIENT_CTA,
  boxShadow: SHADOW_PRIMARY_MEDIUM,
  '&:hover': { background: GRADIENT_CTA, opacity: 0.95 },
  // Stays blue even while disabled (loading): the buttons are never gated on checkboxes -
  // clicking without them shows a validation message instead of a grayed-out button.
  '&.Mui-disabled': { background: GRADIENT_CTA, color: 'white', opacity: 0.75 },
};

export const authGoogleBtnSx: SxProps<Theme> = {
  borderRadius: '12px',
  py: '12px',
  fontSize: '14.5px',
  fontWeight: 700,
  textTransform: 'none',
  color: TEXT_HEADING,
  bgcolor: 'white',
  border: `1.5px solid ${BORDER_LIGHT}`,
  boxShadow: SHADOW_NEUTRAL_SOFT,
  transition: 'all 0.2s ease-in-out',
  '&:hover': { bgcolor: 'white', borderColor: PRIMARY_MAIN, boxShadow: SHADOW_NEUTRAL_SOFT },
  '&:disabled': { bgcolor: 'white', color: TEXT_HEADING, border: `1.5px solid ${BORDER_LIGHT}`, opacity: 1 },
};
