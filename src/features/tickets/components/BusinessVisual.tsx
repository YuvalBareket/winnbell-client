import React from 'react';
import { Paper, Box, Typography, Stack } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QRCode from 'react-qr-code';

interface BusinessVisualProps {
  generatedCode: string | null;
  primaryColor: string;
  isDesktop: boolean;
}

const BusinessVisual: React.FC<BusinessVisualProps> = ({ generatedCode, primaryColor, isDesktop }) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      width: '100%',
      height: '100%',
      minHeight: 280,
      borderRadius: isDesktop ? 3 : 5,
      border: `2px dashed ${primaryColor}4D`,
      bgcolor: `${primaryColor}05`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {generatedCode ? (
      <Stack alignItems='center' spacing={3}>
        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: 1 }}>
          <QRCode
            value={`${window.location.origin}/activate?code=${generatedCode}`}
            size={180}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ textTransform: 'uppercase', fontWeight: 700 }}
          >
            Customer Code
          </Typography>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 900,
              letterSpacing: 4,
              color: primaryColor,
              fontFamily: 'monospace',
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            {generatedCode}
          </Typography>
        </Box>
      </Stack>
    ) : (
      <Stack alignItems='center' spacing={2} color='text.disabled'>
        <QrCode2Icon sx={{ fontSize: 80, opacity: 0.5 }} />
        <Typography variant='body2'>No active code generated</Typography>
      </Stack>
    )}
  </Paper>
);

export default BusinessVisual;
