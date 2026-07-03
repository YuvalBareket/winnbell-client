import { Box, Typography } from '@mui/material';
import { StorefrontOutlined } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import TapArea from '../../../shared/components/TapArea';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

interface LocationCardProps {
  location: ParticipatingLocation;
  primaryColor: string;
  onSelect: (location: ParticipatingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, primaryColor, onSelect }) => (
  <TapArea
    onTap={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 2, mb: 1.5, borderRadius: 3,
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
      cursor: 'pointer', transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
      '&:hover': {
        borderColor: primaryColor || PRIMARY_MAIN,
        bgcolor: `${primaryColor || PRIMARY_MAIN}06`,
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 16px ${primaryColor || PRIMARY_MAIN}15`,
      },
      '&:active': { transform: 'scale(0.98)' },
    }}
  >
    <Box sx={{
      width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
      bgcolor: primaryColor || PRIMARY_MAIN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <StorefrontOutlined sx={{ color: '#ffffff', fontSize: 20 }} />
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary', fontSize: '0.9375rem' }}>
        {location.business_name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25, lineHeight: 1.2, fontSize: '0.78rem' }}>
        {location.address}
      </Typography>
    </Box>
  </TapArea>
);

interface NearbyLocationCardProps {
  location: NearbyLocation;
  primaryColor: string;
  onSelect: (location: NearbyLocation) => void;
  distanceKm?: number;
}

export const NearbyLocationCard: React.FC<NearbyLocationCardProps> = ({ location, primaryColor, onSelect, distanceKm }) => (
  <TapArea
    onTap={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 2, mb: 1.5, borderRadius: 3,
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper',
      cursor: 'pointer', transition: 'border-color 150ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
      '&:hover': {
        borderColor: primaryColor || PRIMARY_MAIN,
        bgcolor: `${primaryColor || PRIMARY_MAIN}06`,
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 16px ${primaryColor || PRIMARY_MAIN}15`,
      },
      '&:active': { transform: 'scale(0.98)' },
    }}
  >
    <Box sx={{
      width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
      bgcolor: primaryColor || PRIMARY_MAIN,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <StorefrontOutlined sx={{ color: '#ffffff', fontSize: 20 }} />
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary', fontSize: '0.9375rem' }}>
        {location.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25, lineHeight: 1.2, fontSize: '0.78rem' }}>
        {location.address}{distanceKm !== undefined && ` . ${distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`}`}
      </Typography>
    </Box>
  </TapArea>
);
