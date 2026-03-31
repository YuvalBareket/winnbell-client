import React from 'react';
import {
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  QrCodeScanner,
  Bolt,
  CardGiftcard,
  ChevronRight,
} from '@mui/icons-material';

interface UserActionsProps {
  code: string;
  setCode: (code: string) => void;
  redeemMutation: { isPending: boolean; isError: boolean; error: any };
  handleActivate: () => void;
  setScannerOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  primaryColor: string;
}

const UserActions: React.FC<UserActionsProps> = ({
  code,
  setCode,
  redeemMutation,
  handleActivate,
  setScannerOpen,
  navigate,
  primaryColor,
}) => (
  <Stack spacing={2}>
    <Box>
      <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1, px: 0.5 }}>
        Ticket Code
      </Typography>
      <TextField
        fullWidth
        placeholder='XXXXXXXX'
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        variant='outlined'
        disabled={redeemMutation.isPending}
        error={redeemMutation.isError}
        helperText={
          redeemMutation.isError
            ? (redeemMutation.error as any).response?.data?.message || 'Invalid code'
            : ''
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <Edit sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: 3,
            bgcolor: 'action.hover',
            fontSize: '1.25rem',
            fontFamily: 'monospace',
            height: 64,
            '& input': { textAlign: 'center' },
          },
        }}
      />
    </Box>
    <Stack spacing={2}>
      <Button
        variant='outlined'
        fullWidth
        startIcon={<QrCodeScanner />}
        onClick={() => setScannerOpen(true)}
        disabled={redeemMutation.isPending}
        sx={{ height: 48, borderRadius: 3, fontWeight: 700 }}
      >
        Scan QR Code
      </Button>
      <Button
        variant='contained'
        fullWidth
        onClick={handleActivate}
        disabled={redeemMutation.isPending || code.length < 5}
        endIcon={
          redeemMutation.isPending ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            <Bolt />
          )
        }
        sx={{
          bgcolor: primaryColor,
          height: 56,
          borderRadius: 3,
          fontWeight: 700,
          boxShadow: `${primaryColor}4D 0px 10px 15px -3px`,
        }}
      >
        Activate Ticket
      </Button>

      <Paper
        elevation={0}
        onClick={() => navigate('/freeTicket')}
        sx={{
          p: 1,
          px: 3,
          borderRadius: 4,
          bgcolor: `${primaryColor}0A`,
          border: `1px solid ${primaryColor}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: '0.2s',
          '&:hover': { bgcolor: `${primaryColor}14`, transform: 'translateY(-2px)' },
        }}
      >
        <Box sx={{ bgcolor: primaryColor, borderRadius: 2, p: 1, display: 'flex', color: 'white' }}>
          <CardGiftcard fontSize='small' />
        </Box>
        <Stack flex={1}>
          <Typography variant='body2' fontWeight={700}>Free Weekly Ticket</Typography>
          <Typography variant='caption' color='text.secondary'>
            Claim your 1 free entry for this week
          </Typography>
        </Stack>
        <ChevronRight sx={{ color: primaryColor }} />
      </Paper>

    </Stack>
  </Stack>
);

export default UserActions;
