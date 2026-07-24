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
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import {
  PRIMARY_MAIN, PRIMARY_TINT, GRADIENT_CTA, SHADOW_PRIMARY_SOFT, SHADOW_PRIMARY_MEDIUM,
  TEXT_SECONDARY, TEXT_HEADING, ALPHA_PRIMARY_40, ALPHA_BLACK_04,
} from '../../../../shared/colors';
import { IconTile } from './adminUi';
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        {/* Title with icon tile */}
        <DialogTitle sx={{ pb: 2, pt: 3, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconTile icon={<AddIcon />} tint={PRIMARY_TINT} color={PRIMARY_MAIN} size={40} />
            <Box>
              <Box sx={{ fontWeight: 800, fontSize: 18, color: TEXT_HEADING }}>Add New Business</Box>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Business Name'
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '12px',
                  },
                },
              }}
            />

            <TextField
              select
              label='Sector'
              fullWidth
              value={formData.sector}
              onChange={(e) =>
                setFormData({ ...formData, sector: e.target.value })
              }
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '12px',
                  },
                },
              }}
            >
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
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '12px',
                  },
                },
              }}
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
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '12px',
                    },
                  },
                }}
              />
              <TextField
                label='Longitude'
                type='number'
                fullWidth
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '12px',
                    },
                  },
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: TEXT_SECONDARY,
              '&:hover': { bgcolor: ALPHA_BLACK_04 },
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={
              mutation.isPending || !formData.latitude || !formData.longitude
            }
            sx={{
              background: GRADIENT_CTA,
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '12px',
              boxShadow: SHADOW_PRIMARY_SOFT,
              '&:hover': {
                boxShadow: SHADOW_PRIMARY_MEDIUM,
              },
              '&:disabled': {
                background: ALPHA_PRIMARY_40,
              },
            }}
          >
            {mutation.isPending ? 'Saving...' : 'Create Business'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default CreateBusinessModal;
