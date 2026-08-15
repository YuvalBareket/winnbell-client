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
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // Reserve the scrollbar track so transient overflow (animations, card swipes) never shifts the layout
          scrollbarGutter: 'stable',
        },
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        // CSS-driven motion honors the OS reduced-motion setting (framer-motion is
        // covered separately by MotionConfig in App.tsx). Opacity/color feedback
        // still lands - only movement is removed.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          boxShadow: 'none',
          padding: '10px 22px',
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease-out',
          // Feedback lives on the press, and it's instant: buttons visibly give
          // under the finger on pointer-down, not on release.
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '0.95rem',
          borderRadius: 32,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: `0 4px 14px rgba(2,146,183,0.3)`,
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
          borderRadius: 10,
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
          // Only compositor/paint-cheap properties - 'all' also animated layout.
          transition: 'background-color 0.15s ease, color 0.15s ease',
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 32,
        },
      },
    },
  },
});
