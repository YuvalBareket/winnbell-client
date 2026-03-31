import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
} from '@mui/material';

interface InviteManagerDialogProps {
  open: boolean;
  onClose: () => void;
  inviteUrl: string | null;
  onCopyLink?: () => void;
}

const InviteManagerDialog: React.FC<InviteManagerDialogProps> = ({
  open,
  onClose,
  inviteUrl,
  onCopyLink,
}) => {
  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      if (onCopyLink) onCopyLink();
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Manager Invite Link</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Share this link with the manager to invite them:
        </Typography>
        <TextField
          fullWidth
          value={inviteUrl || ''}
          InputProps={{ readOnly: true }}
          variant='outlined'
          sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Typography variant='caption' color='text.secondary'>
          They can use this link to set up their account and manage your location.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ gap: 1, p: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Close
        </Button>
        <Button
          variant='contained'
          onClick={handleCopyLink}
          sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
        >
          Copy Link
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteManagerDialog;
