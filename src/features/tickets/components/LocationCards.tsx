import { Box, Typography, Chip } from '@mui/material';
import { StorefrontOutlined } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

interface LocationCardProps {
  location: ParticipatingLocation;
  primaryColor: string;
  onSelect: (location: ParticipatingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, primaryColor, onSelect }) => (
  <Box
    onClick={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.75, mb: 1, borderRadius: 4,
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
      cursor: 'pointer', transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
      '&:hover': {
        borderColor: primaryColor || PRIMARY_MAIN,
        bgcolor: `${primaryColor || PRIMARY_MAIN}06`,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${primaryColor || PRIMARY_MAIN}20`,
      },
      '&:active': { transform: 'scale(0.97)' },
    }}
  >
    <Box sx={{
      width: 38, height: 38, borderRadius: 2, flexShrink: 0,
      bgcolor: `${primaryColor || PRIMARY_MAIN}12`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <StorefrontOutlined sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 20 }} />
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {location.business_name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
        {location.address}
      </Typography>
    </Box>
  </Box>
);

interface NearbyLocationCardProps {
  location: NearbyLocation;
  primaryColor: string;
  onSelect: (location: NearbyLocation) => void;
  distanceKm?: number;
}

export const NearbyLocationCard: React.FC<NearbyLocationCardProps> = ({ location, primaryColor, onSelect, distanceKm }) => (
  <Box
    onClick={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.75, mb: 1, borderRadius: 4,
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
      cursor: 'pointer', transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
      '&:hover': {
        borderColor: primaryColor || PRIMARY_MAIN,
        bgcolor: `${primaryColor || PRIMARY_MAIN}06`,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${primaryColor || PRIMARY_MAIN}20`,
      },
      '&:active': { transform: 'scale(0.97)' },
    }}
  >
    <Box sx={{
      width: 38, height: 38, borderRadius: 2, flexShrink: 0,
      bgcolor: `${primaryColor || PRIMARY_MAIN}12`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <StorefrontOutlined sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 20 }} />
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {location.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
        {location.address}
      </Typography>
    </Box>
    {distanceKm !== undefined && (
      <Chip
        label={distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`}
        size="small"
        sx={{
          bgcolor: `${primaryColor || PRIMARY_MAIN}12`,
          color: primaryColor || PRIMARY_MAIN,
          fontWeight: 700, fontSize: '0.68rem', height: 22, flexShrink: 0,
          border: `1px solid ${primaryColor || PRIMARY_MAIN}25`,
        }}
      />
    )}
  </Box>
);
