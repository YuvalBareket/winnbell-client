import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';
import { useActiveDraws, useGenerateTickets } from '../../hooks/useAdmin';
interface Props {
  open: boolean;
  onClose: () => void;
  businessId: number | null;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const GenerateTicketsModal: React.FC<Props> = ({
  open,
  onClose,
  businessId,
}) => {
  const { data: draws, isLoading: drawsLoading } = useActiveDraws();
  const mutation = useGenerateTickets();
  const [drawId, setDrawId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(100);

  const handleSubmit = async () => {
    if (!businessId || !drawId) return;
    mutation.mutate(
      { businessId, drawId: Number(drawId), quantity },
      {
        onSuccess: () => {
          onClose();
          setDrawId('');
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant='h6' mb={2}>
          Generate Ticket Batch
        </Typography>
        {mutation.isError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            Generation failed.
          </Alert>
        )}
        <Stack spacing={3}>
          <TextField
            select
            label='Select Draw'
            value={drawId}
            onChange={(e) => setDrawId(e.target.value)}
            fullWidth
            disabled={drawsLoading}
          >
            {draws?.map((draw) => (
              <MenuItem key={draw.id} value={draw.id}>
                {draw.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label='Quantity'
            type='number'
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 1000 }}
          />
          <Box display='flex' justifyContent='flex-end' gap={1}>
            <Button onClick={onClose} color='inherit'>
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={mutation.isPending || !drawId}
            >
              {mutation.isPending ? <CircularProgress size={24} /> : 'Generate'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default GenerateTicketsModal;
