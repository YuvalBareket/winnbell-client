import { useRef } from 'react';
import { Box, Button } from '@mui/material';
import html2canvas from 'html2canvas';

export default function LogoDesignPage() {
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { useCORS: true, scale: 2 });
    const link = document.createElement('a');
    link.download = 'winnbell_icon.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Box
        ref={captureRef}
        sx={{
          width: 600,
          height: 600,
          background: 'linear-gradient(135deg, #e8f0fe 3%, #195DE6 40%, #06347E 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component='img'
          src='/winnbell_logo_white.png'
          alt='Winnbell'
          sx={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 0px 30px rgba(255,255,255,0.8))' }}
        />
      </Box>

      <Button variant='contained' onClick={handleDownload}>
        Download PNG
      </Button>
    </Box>
  );
}
