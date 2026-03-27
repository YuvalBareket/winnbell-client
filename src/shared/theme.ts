import { createTheme } from '@mui/material/styles';
import {
  PRIMARY_MAIN,
  BG_DEFAULT,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
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
    },
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          padding: '10px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});
