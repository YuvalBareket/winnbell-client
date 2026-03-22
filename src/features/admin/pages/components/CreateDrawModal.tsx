import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useCreateDraw } from '../../hooks/useAdmin';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CreateDrawModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const mutation = useCreateDraw();
  const [formData, setFormData] = useState({
    name: '',
    prize_name: '',
    prize_amount: '',
    draw_date: '',
  });

  const handleSubmit = () => {
    mutation.mutate(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: '',
          prize_name: '',
          prize_amount: '',
          draw_date: '',
        });
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant='h6' mb={3}>
          Create New Draw
        </Typography>
        <Stack spacing={2}>
          <TextField
            label='Draw Name (e.g. March 2026)'
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label='Prize Name'
            fullWidth
            value={formData.prize_name}
            onChange={(e) =>
              setFormData({ ...formData, prize_name: e.target.value })
            }
          />
          <TextField
            label='Prize Amount'
            type='number'
            fullWidth
            value={formData.prize_amount}
            onChange={(e) =>
              setFormData({ ...formData, prize_amount: e.target.value })
            }
          />
          <TextField
            label='Draw Date'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.draw_date}
            onChange={(e) =>
              setFormData({ ...formData, draw_date: e.target.value })
            }
          />
          <Box display='flex' justifyContent='flex-end' gap={1} mt={2}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Create Draw'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateDrawModal;
