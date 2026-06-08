import {
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { StorefrontOutlined } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { LocationCard, NearbyLocationCard } from './LocationCards';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

interface Props {
  primaryColor: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedTerm: string;
  isSearching: boolean;
  searchResults: ParticipatingLocation[];
  nearbyLocations: NearbyLocation[];
  onLocationSelect: (location: ParticipatingLocation | NearbyLocation) => void;
}

const BusinessSelector: React.FC<Props> = ({
  primaryColor,
  searchTerm,
  setSearchTerm,
  debouncedTerm,
  isSearching,
  searchResults,
  nearbyLocations,
  onLocationSelect,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Step label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: '50%',
          bgcolor: primaryColor || PRIMARY_MAIN,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>1</Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Select a business
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by name or address…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <StorefrontOutlined sx={{ fontSize: 20, color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
            '&.Mui-focused fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
          },
        }}
      />

      {/* Location list */}
      {searchTerm.length >= 2 && debouncedTerm.length >= 2 ? (
        <>
          <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'text.disabled', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Results
          </Typography>
          {isSearching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 3, justifyContent: 'center' }}>
              <CircularProgress size={18} sx={{ color: primaryColor || PRIMARY_MAIN }} />
              <Typography variant="body2" color="text.secondary">Searching…</Typography>
            </Box>
          ) : searchResults.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No locations found.</Typography>
              <Typography variant="caption" color="text.disabled">Try a different search term.</Typography>
            </Box>
          ) : (
            searchResults.map((loc) => (
              <LocationCard key={loc.location_id} location={loc} primaryColor={primaryColor} onSelect={onLocationSelect} />
            ))
          )}
        </>
      ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', py: 1, pl: 0.5 }}>
          Type at least 2 characters…
        </Typography>
      ) : nearbyLocations.length > 0 ? (
        <>
          <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'text.disabled', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            📍 Nearest to you
          </Typography>
          {nearbyLocations.map((loc) => (
            <NearbyLocationCard key={loc.location_id} location={loc} primaryColor={primaryColor} onSelect={onLocationSelect} />
          ))}
        </>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">Start typing to find a business</Typography>
        </Box>
      )}
    </Box>
  );
};

export default BusinessSelector;
