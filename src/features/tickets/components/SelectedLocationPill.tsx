import { Box, Button, Typography } from '@mui/material';
import { StorefrontOutlined } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';

interface Props {
  primaryColor: string;
  location: ParticipatingLocation;
  onChangeLocation: () => void;
}

const SelectedLocationPill: React.FC<Props> = ({ primaryColor, location, onChangeLocation }) => {
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.5, mb: 3, borderRadius: 2.5,
        bgcolor: `${primaryColor || PRIMARY_MAIN}10`,
        border: `1.5px solid ${primaryColor || PRIMARY_MAIN}30`,
      }}
    >
      <Box
        sx={{
          width: 36, height: 36, borderRadius: 2, flexShrink: 0,
          bgcolor: primaryColor || PRIMARY_MAIN,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <StorefrontOutlined sx={{ color: '#fff', fontSize: 18 }} />
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
          {location.business_name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {location.address}
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={onChangeLocation}
        sx={{
          color: primaryColor || PRIMARY_MAIN, fontWeight: 700,
          fontSize: '0.75rem', minWidth: 'auto', px: 1.5,
          '&:hover': { bgcolor: `${primaryColor || PRIMARY_MAIN}15` },
        }}
      >
        Change
      </Button>
    </Box>
  );
};

export default SelectedLocationPill;
