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
  Divider,
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
  hideScan?: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({
  code,
  setCode,
  redeemMutation,
  handleActivate,
  setScannerOpen,
  navigate,
  primaryColor,
  hideScan = false,
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {/* Ticket Code Input */}
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

    {/* Activate Ticket Button */}
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

    {!hideScan && (
      <>
        {/* Divider with "or" */}
        <Divider sx={{ my: 1 }}>
          <Typography variant='caption' color='text.secondary' fontWeight={600} sx={{ px: 1 }}>or</Typography>
        </Divider>

        {/* Scan QR Code Button */}
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
      </>
    )}

    {/* Divider */}
    <Divider sx={{ my: 1 }} />

    {/* Free Weekly Ticket Card */}
    <Paper
      elevation={0}
      onClick={() => navigate('/freeTicket')}
      sx={{
        p: 1.5,
        px: 2,
        borderRadius: 3,
        bgcolor: `${primaryColor}0A`,
        border: `1px solid ${primaryColor}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: '0.2s',
        '&:hover': { bgcolor: `${primaryColor}14`, transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ bgcolor: primaryColor, borderRadius: 1.5, p: 0.75, display: 'flex', color: 'white' }}>
        <CardGiftcard fontSize='small' />
      </Box>
      <Stack flex={1} spacing={0.25}>
        <Typography variant='body2' fontWeight={700} sx={{ lineHeight: 1.2 }}>Free Weekly Ticket</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.2 }}>
          Claim 1 free entry
        </Typography>
      </Stack>
      <ChevronRight sx={{ color: primaryColor, fontSize: 20 }} />
    </Paper>
  </Box>
);

export default UserActions;
