import React from 'react';
import { Box, Paper } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';

interface UserVisualProps {
  primaryColor: string;
}

const UserVisual: React.FC<UserVisualProps> = ({ primaryColor }) => (
  <Box
    sx={{
      width: 192,
      height: 192,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mx: 'auto',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: `${primaryColor}1A`,
        borderRadius: '50%',
        transform: 'scale(1.1)',
      }}
    />
    <Paper
      elevation={4}
      sx={{
        width: 128,
        height: 150,
        position: 'relative',
        zIndex: 10,
        transform: 'rotate(-3deg)',
        p: 2,
        border: `2px solid ${primaryColor}33`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        bgcolor: 'white',
      }}
    >
      <Box sx={{ height: 8, width: '75%', bgcolor: `${primaryColor}33`, borderRadius: 1 }} />
      <Box sx={{ height: 8, width: '50%', bgcolor: `${primaryColor}1A`, borderRadius: 1 }} />
      <Box
        sx={{
          mt: 'auto',
          borderTop: `2px dashed ${primaryColor}4D`,
          pt: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.5,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              width: 16,
              height: 16,
              bgcolor: i % 2 === 0 ? `${primaryColor}66` : primaryColor,
              borderRadius: '50%',
            }}
          />
        ))}
      </Box>
    </Paper>
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 20,
        width: 48,
        height: 48,
        bgcolor: primaryColor,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'rotate(12deg)',
        boxShadow: 3,
      }}
    >
      <QrCode2Icon sx={{ color: 'white', fontSize: 28 }} />
    </Box>
  </Box>
);

export default UserVisual;
