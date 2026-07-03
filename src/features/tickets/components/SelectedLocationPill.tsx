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
        p: 2, mb: 3, borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
          bgcolor: primaryColor || PRIMARY_MAIN,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <StorefrontOutlined sx={{ color: '#fff', fontSize: 20 }} />
      </Box>
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
          {location.business_name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
          {location.address}
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={onChangeLocation}
        sx={{
          color: primaryColor || PRIMARY_MAIN, fontWeight: 700,
          fontSize: '0.75rem', minWidth: 'auto', px: 1.5, py: 0.5,
          textTransform: 'none',
          '&:hover': { bgcolor: `${primaryColor || PRIMARY_MAIN}08` },
        }}
      >
        Change
      </Button>
    </Box>
  );
};

export default SelectedLocationPill;
