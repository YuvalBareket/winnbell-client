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
import type { NearbyLocation } from '../types/nearBy.types';

type Props = {
  location: NearbyLocation | null;
  onClose: () => void;
};

const MapBusinessPopup: React.FC<Props> = ({ location, onClose }) => {
  if (!location) return null;

  return (
    <Drawer
      anchor='bottom'
      open={!!location}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          p: 3,
          maxHeight: '45vh',
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
              src={location.logo_url}
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: 'primary.light',
              }}
            >
              {location.name[0]}
            </Avatar>
            <Box>
              <Typography variant='h6' fontWeight={700}>
                {location.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {location.sector} • {location.address}
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1}>
            <Chip
              icon={<LocationOn sx={{ fontSize: '16px !important' }} />}
              label={
                location.distance_km
                  ? `${location.distance_km.toFixed(1)} km`
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
            {location.terms_text ||
              'Visit this business to earn lottery tickets!'}
          </Typography>

          <Button
            fullWidth
            variant='contained'
            size='large'
            startIcon={<Directions />}
            sx={{ borderRadius: 3, py: 1.5 }}
            onClick={() => {
              // Open native Google Maps with coordinates
              const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
              window.open(url, '_blank');
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