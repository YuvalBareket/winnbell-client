import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  Button,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Directions,
  Close,
  CheckCircle,
  LocationOn,
} from '@mui/icons-material';
import type { IBusiness } from '../types/nearBy.types';

type Props = {
  business: IBusiness | null;
  onClose: () => void;
};

const MapBusinessPopup: React.FC<Props> = ({ business, onClose }) => {
  if (!business) return null;
  return (
    <Drawer
      anchor='bottom'
      open={!!business}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          p: 3,
          maxHeight: '40vh',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: -8, top: -8 }}
        >
          <Close />
        </IconButton>

        <Stack spacing={2}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              src={business?.logo_url}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: 'primary.light',
              }}
            >
              {business?.name[0]}
            </Avatar>
            <Box>
              <Typography variant='h6' fontWeight={700}>
                {business?.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {business?.sector} • {business?.location}
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1}>
            <Chip
              icon={<LocationOn sx={{ fontSize: '16px !important' }} />}
              label={
                business?.distance_km
                  ? `${business.distance_km.toFixed(1)} km`
                  : 'Nearby'
              }
              size='small'
              variant='outlined'
            />
            <Chip
              icon={<CheckCircle sx={{ fontSize: '16px !important' }} />}
              label='Active Partner'
              size='small'
              color='success'
            />
          </Stack>

          <Typography variant='body2' sx={{ color: 'text.secondary', py: 1 }}>
            {business?.terms_text ||
              'Visit this business to earn lottery tickets!'}
          </Typography>

          <Button
            fullWidth
            variant='contained'
            size='large'
            startIcon={<Directions />}
            sx={{ borderRadius: 3, py: 1.5 }}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`,
              );
            }}
          >
            Get Directions
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default MapBusinessPopup;
