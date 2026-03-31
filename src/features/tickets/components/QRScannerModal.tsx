import React, { useEffect, useRef, useState } from 'react';
import { Box, Dialog, IconButton, Typography, Stack } from '@mui/material';
import { Close, QrCodeScanner } from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  open: boolean;
  onScan: (code: string) => void;
  onClose: () => void;
}

const SCANNER_ID = 'qr-scanner-view';

const QRScannerModal: React.FC<Props> = ({ open, onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [camError, setCamError] = useState('');
  const didScan = useRef(false);

  useEffect(() => {
    if (!open) return;
    didScan.current = false;
    setCamError('');

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (didScan.current) return;
          didScan.current = true;
          scanner.stop().catch(() => {}).finally(() => {
            onScan(decoded.trim().toUpperCase());
          });
        },
        () => {},
      )
      .catch(() => setCamError('Camera access denied. Please allow camera permission and try again.'));

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullScreen PaperProps={{ sx: { bgcolor: '#000' } }}>
      <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* Close */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}
        >
          <Close />
        </IconButton>

        {/* Top label */}
        <Box sx={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', zIndex: 10, px: 4 }}>
          <Stack direction='row' alignItems='center' justifyContent='center' spacing={1} mb={0.5}>
            <QrCodeScanner sx={{ color: 'white', fontSize: 20 }} />
            <Typography variant='subtitle1' fontWeight={800} sx={{ color: 'white' }}>
              Scan Ticket
            </Typography>
          </Stack>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Point your camera at the QR code on the receipt
          </Typography>
        </Box>

        {/* Camera view */}
        <Box
          id={SCANNER_ID}
          sx={{
            width: '100%',
            height: '100%',
            '& video': { width: '100% !important', height: '100% !important', objectFit: 'cover' },
            '& canvas': { display: 'none' },
          }}
        />

        {/* Viewfinder overlay */}
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Box sx={{ width: 260, height: 260, position: 'relative' }}>
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTop: '3px solid white', borderLeft: '3px solid white', borderRadius: '4px 0 0 0' },
              { top: 0, right: 0, borderTop: '3px solid white', borderRight: '3px solid white', borderRadius: '0 4px 0 0' },
              { bottom: 0, left: 0, borderBottom: '3px solid white', borderLeft: '3px solid white', borderRadius: '0 0 0 4px' },
              { bottom: 0, right: 0, borderBottom: '3px solid white', borderRight: '3px solid white', borderRadius: '0 0 4px 0' },
            ].map((sx, i) => (
              <Box key={i} sx={{ position: 'absolute', width: 28, height: 28, ...sx }} />
            ))}
          </Box>
        </Box>

        {camError && (
          <Box sx={{ position: 'absolute', bottom: 60, left: 16, right: 16, bgcolor: 'rgba(211,47,47,0.9)', borderRadius: 2, p: 2, textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: 'white', fontWeight: 600 }}>{camError}</Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default QRScannerModal;
