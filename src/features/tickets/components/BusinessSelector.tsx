import {
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { StorefrontOutlined, NearMeOutlined } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { SPRING_POP } from '../../../shared/motion';
import { LocationCard, NearbyLocationCard } from './LocationCards';

// Cards mount after their fetch resolves, so they animate themselves (explicit
// initial/animate with a per-index delay) instead of joining the page stagger.
const cardEntrance = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { ...SPRING_POP, delay: i * 0.06 },
});
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
    <Box sx={{ mb: 3 }}>
      {/* Heading (the numbered step lives in the page step bar) */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', lineHeight: 1.3 }}>
          Where did you shop?
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
          Pick the business from your receipt.
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Search by name or address"
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
          mb: 2.5,
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            borderRadius: '12px',
            '& fieldset': { borderColor: 'divider' },
            '&:hover fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
            '&.Mui-focused fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
          },
          // 16px on mobile prevents Safari's focus zoom; smaller only on desktop.
          '& .MuiOutlinedInput-input': { fontSize: { xs: '16px', md: '0.875rem' } },
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
            searchResults.map((loc, i) => (
              <motion.div key={loc.location_id} {...cardEntrance(i)}>
                <LocationCard location={loc} primaryColor={primaryColor} onSelect={onLocationSelect} />
              </motion.div>
            ))
          )}
        </>
      ) : searchTerm.length > 0 && searchTerm.length < 2 ? (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', py: 1, pl: 0.5 }}>
          Type at least 2 characters…
        </Typography>
      ) : nearbyLocations.length > 0 ? (
        <>
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5, color: 'text.disabled', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            <NearMeOutlined sx={{ fontSize: 13 }} />
            Nearest to you
          </Typography>
          {nearbyLocations.slice(0, 3).map((loc, i) => (
            <motion.div key={loc.location_id} {...cardEntrance(i)}>
              <NearbyLocationCard location={loc} primaryColor={primaryColor} onSelect={onLocationSelect} />
            </motion.div>
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
