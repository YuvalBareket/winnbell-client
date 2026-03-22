import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
} from '@mui/material';
import { useCreateBusiness } from '../../hooks/useAdmin';
import { BUSINESS_SECTORS } from '../../data';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

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

  const handleSubmit = () => {
    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        onClose();
        setFormData({
          name: '',
          sector: defaultSector,
          location: '',
          latitude: '',
          longitude: '',
          owner_user_id: 1,
        });
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant='h6' mb={3}>
          Add New Business
        </Typography>
        <Stack spacing={2}>
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

          <Box display='flex' justifyContent='flex-end' gap={1} mt={2}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={
                mutation.isPending || !formData.latitude || !formData.longitude
              }
            >
              {mutation.isPending ? 'Saving...' : 'Create Business'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateBusinessModal;
