import { createTheme } from '@mui/material/styles';
import {
  PRIMARY_MAIN,
  BG_DEFAULT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SHADOW_CARD,
  SHADOW_CARD_HOVER,
  BORDER_SUBTLE,
} from './colors';

export const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY_MAIN,
      contrastText: '#ffffff',
    },
    background: {
      default: BG_DEFAULT,
      paper: '#ffffff',
    },
    text: {
      primary: TEXT_PRIMARY,
      secondary: TEXT_SECONDARY,
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Manrope", "Roboto", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15 },
    h3: { fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 },
    h5: { fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
    h6: { fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.35 },
    subtitle1: { fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, lineHeight: 1.5 },
    body1: { lineHeight: 1.65, letterSpacing: '0.005em' },
    body2: { lineHeight: 1.6 },
    caption: { lineHeight: 1.5, letterSpacing: '0.02em' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          padding: '10px 22px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.95rem',
          borderRadius: 14,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: `0 4px 14px rgba(25,93,230,0.3)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: SHADOW_CARD,
          transition: 'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow: SHADOW_CARD,
        },
        elevation2: {
          boxShadow: SHADOW_CARD_HOVER,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: SHADOW_CARD,
          border: `1px solid ${BORDER_SUBTLE}`,
          '&:hover': {
            boxShadow: SHADOW_CARD_HOVER,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: BORDER_SUBTLE,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          padding: '6px 12px',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
