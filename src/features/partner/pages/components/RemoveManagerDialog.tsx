import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';

interface RemoveManagerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const RemoveManagerDialog: React.FC<RemoveManagerDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ fontWeight: 700 }}>Remove Branch Manager?</DialogTitle>
    <DialogContent>
      <Typography variant='body2' color='text.secondary'>
        This will unassign the manager from this location. Their account will be reset to a regular user and they will lose access to branch tools.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
      <Button onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
      <Button
        variant='contained'
        color='error'
        disabled={isLoading}
        onClick={onConfirm}
        sx={{ borderRadius: 2, fontWeight: 700 }}
      >
        {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Remove Manager'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default RemoveManagerDialog;
