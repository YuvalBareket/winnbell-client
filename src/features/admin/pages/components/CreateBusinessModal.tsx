import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { useCreateBusiness } from '../../hooks/useAdmin';
import { BUSINESS_SECTORS } from '../../data';

const CreateBusinessModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const mutation = useCreateBusiness();

  // Helper to get the first key for default state
  const defaultSector = Object.keys(BUSINESS_SECTORS)[0];

  const [formData, setFormData] = useState({
    name: '',
    sector: defaultSector,
    location: '',
    latitude: '',
    longitude: '',
    owner_user_id: 1,
  });

  const handleClose = () => {
    setFormData({
      name: '',
      sector: defaultSector,
      location: '',
      latitude: '',
      longitude: '',
      owner_user_id: 1,
    });
    onClose();
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>Add New Business</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label='Business Name'
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <TextField
            select
            label='Sector'
            fullWidth
            value={formData.sector}
            onChange={(e) =>
              setFormData({ ...formData, sector: e.target.value })
            }
          >
            {/* Now mapping through Object entries instead of array */}
            {Object.entries(BUSINESS_SECTORS).map(([key, sector]) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      color: sector.color,
                      '& svg': { fontSize: 20 },
                    }}
                  >
                    {sector.icon}
                  </Box>
                  {sector.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label='Physical Address'
            placeholder='e.g. 123 Main St, London'
            fullWidth
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />

          <Stack direction='row' spacing={2}>
            <TextField
              label='Latitude'
              type='number'
              fullWidth
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value })
              }
            />
            <TextField
              label='Longitude'
              type='number'
              fullWidth
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value })
              }
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={
            mutation.isPending || !formData.latitude || !formData.longitude
          }
        >
          {mutation.isPending ? 'Saving...' : 'Create Business'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBusinessModal;
