import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, Drawer, Box, Button, IconButton, LinearProgress, Typography,
  CircularProgress, useMediaQuery, useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import LegalMarkdown from './LegalMarkdown';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  title: string;
  content: string;
  loading?: boolean;
}

// Clickwrap viewer: a register-page checkbox can only be checked by accepting here.
// Opening the dialog is required but scrolling is not - courts enforce checkbox
// clickwrap without a forced scroll, and the full text stays one tap away on its
// legal page. The progress bar is a reading cue only, not a gate.
const LegalAcceptDialog = ({ open, onClose, onAccept, title, content, loading = false }: Props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [scrollProgress, setScrollProgress] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Fresh read position on every open: state resets via the adjust-during-render pattern
  // (the component stays mounted while the Dialog/Drawer paper unmounts), DOM via effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setScrollProgress(0);
  }
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [open]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 100);
  };

  const headerContent = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
      <Typography variant='h6' fontWeight={800} id='legal-accept-dialog-title'>
        {title}
      </Typography>
      <IconButton onClick={onClose} size='small' sx={{ flexShrink: 0 }}>
        <Close fontSize='small' />
      </IconButton>
    </Box>
  );

  const bodyContent = (
    <Box
      ref={bodyRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: 'auto',
        px: 2.5,
        py: 2,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <LegalMarkdown content={content} />
      )}
    </Box>
  );

  const footerContent = (
    <Box sx={{ px: 2, py: 2 }}>
      <Button
        fullWidth
        variant='contained'
        onClick={onAccept}
        disabled={loading}
        sx={{ borderRadius: '8px', py: 1.25, fontWeight: 700 }}
      >
        I have read and agree
      </Button>
    </Box>
  );

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        aria-labelledby='legal-accept-dialog-title'
        PaperProps={{
          sx: {
            borderRadius: '16px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {headerContent}
        </Box>

        <LinearProgress
          variant='determinate'
          value={scrollProgress}
          sx={{ height: '3px', flexShrink: 0 }}
        />

        {bodyContent}

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {footerContent}
        </Box>
      </Dialog>
    );
  }

  // Mobile: Bottom Sheet Drawer
  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      aria-labelledby='legal-accept-dialog-title'
      PaperProps={{
        sx: {
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          height: 'calc(var(--dvh100, 100dvh) * 0.9)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
      }}
    >
      {/* Drag handle indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, flexShrink: 0 }}>
        <Box
          sx={{
            width: '36px',
            height: '4px',
            borderRadius: '2px',
            bgcolor: 'action.disabled',
          }}
        />
      </Box>

      <Box sx={{ px: 2, py: 1, flexShrink: 0 }}>
        {headerContent}
      </Box>

      <LinearProgress
        variant='determinate'
        value={scrollProgress}
        sx={{ height: '2px', flexShrink: 0 }}
      />

      {bodyContent}

      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {footerContent}
      </Box>
    </Drawer>
  );
};

export default LegalAcceptDialog;
