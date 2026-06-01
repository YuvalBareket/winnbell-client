import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { AccessTime, Close, EmojiEvents, ReceiptOutlined } from '@mui/icons-material';
import { useUploadReceiptImage } from '../hooks/useUploadReceiptImage';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import { PRIMARY_MAIN } from '../../../shared/colors';
import EntrySuccessDialog from './EntrySuccessDialog';
import ReceiptImageUploadField from './ReceiptImageUploadField';
import BusinessSelector from './BusinessSelector';
import SelectedLocationPill from './SelectedLocationPill';
import { getNearbyBusinesses } from '../../nearBy/api/nearBy.api';
import { useSearchParticipatingLocations } from '../hooks/useAllParticipatingLocations';
import { useSubmitReceiptEntry } from '../hooks/useSubmitReceiptEntry';
import { fetchParticipatingLocationById } from '../api/ticketsApi';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

interface ReceiptEntryFormProps {
  primaryColor: string;
  preselectedBusinessId?: number;
  preselectedLocation?: NearbyLocation;
  preselectedLocationId?: number;
  onSuccess?: (ticketId: number) => void;
  onError?: (message: string) => void;
  onLocationSelect?: (hasLocation: boolean) => void;
  onBlockedChange?: (blocked: boolean) => void;
}

const toParticipating = (n: NearbyLocation): ParticipatingLocation => ({
  location_id: n.location_id,
  location_name: n.name,
  address: n.address,
  business_id: n.id,
  business_name: n.name,
  sector: n.sector,
  logo_url: n.logo_url,
  receipt_example_image_url: n.receipt_example_image_url,
  min_transaction_amount: null,
});

const ReceiptEntryForm: React.FC<ReceiptEntryFormProps> = ({
  primaryColor,
  preselectedBusinessId,
  preselectedLocation,
  preselectedLocationId,
  onSuccess,
  onError,
  onLocationSelect,
  onBlockedChange,
}) => {
  // ──────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<ParticipatingLocation | null>(null);
  const userChangedLocation = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [receiptIdentifier, setReceiptIdentifier] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const receiptKeystrokeTimesRef = useRef<number[]>([]);
  const [receiptWasPasted, setReceiptWasPasted] = useState(false);
  const [requiresImage, setRequiresImage] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submittedEntryCount, setSubmittedEntryCount] = useState<number>(1);
  const [exampleOpen, setExampleOpen] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 350);

  // ──────────────────────────────────────────────────
  // Hooks
  // ──────────────────────────────────────────────────
  const navigate = useNavigate();
  const riskLevel = useMyRiskLevel();
  const { data: searchResults = [], isFetching: isSearching } = useSearchParticipatingLocations(debouncedTerm);
  const receiptImageUpload = useUploadReceiptImage();

  const { data: preselectedLocationData, isFetching: isLocationFetching } = useQuery({
    queryKey: ['participating-location', preselectedLocationId],
    queryFn: () => fetchParticipatingLocationById(preselectedLocationId!),
    enabled: !!preselectedLocationId && !preselectedLocation && !preselectedBusinessId,
    staleTime: 5 * 60_000,
  });

  const submitReceiptEntry = useSubmitReceiptEntry({
    onSuccess: (data) => {
      setSubmittedCode(data.code ?? null);
      setSubmittedEntryCount(data.entryCount ?? 1);
      setSuccessDialogOpen(true);
      setReceiptIdentifier('');
      setTransactionAmount('');
      setErrorMessage('');
      receiptKeystrokeTimesRef.current = [];
      setReceiptWasPasted(false);
      setRequiresImage(false);
      setReceiptImageUrl(null);
      riskLevel.refetch();
      onSuccess?.(data.ticketId);
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Submission failed. Please try again.';
      if (message === 'A receipt image is required to submit an entry.') {
        setRequiresImage(true);
        setErrorMessage('Please attach a photo of your receipt to continue.');
        riskLevel.refetch();
      } else {
        setErrorMessage(message);
        riskLevel.refetch();
      }
      onError?.(message);
    },
  });

  // Notify parent when a location is selected/cleared
  useEffect(() => {
    onLocationSelect?.(!!selectedLocation);
  }, [selectedLocation, onLocationSelect]);

  // Notify parent when blocked state changes (throttled or daily limit)
  useEffect(() => {
    const blocked = riskLevel.isThrottled || riskLevel.isDailyLimitReached || riskLevel.isDrawCapped;
    onBlockedChange?.(blocked);
  }, [riskLevel.isThrottled, riskLevel.isDailyLimitReached, riskLevel.isDrawCapped, onBlockedChange]);

  // ──────────────────────────────────────────────────
  // Fetch nearby locations on mount
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const radiusKm = 5;
          const latDelta = radiusKm / 111;
          const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));
          const nearby = await getNearbyBusinesses({
            minLat: lat - latDelta, maxLat: lat + latDelta,
            minLng: lng - lngDelta, maxLng: lng + lngDelta,
            limit: 2,
          });
          setNearbyLocations(nearby);
        } catch {
          // Silent failure
        }
      },
      () => {
        // Silent failure
      },
      { timeout: 8000 },
    );
  }, []);

  // Auto-select location if preselected (skip if user manually cleared the selection)
  useEffect(() => {
    if (userChangedLocation.current) return;
    if (selectedLocation) return;
    if (preselectedLocationData) {
      setSelectedLocation(preselectedLocationData);
      return;
    }
    // If full location object was passed directly (e.g. from NearBy drawer), use it immediately
    if (preselectedLocation) {
      setSelectedLocation(toParticipating(preselectedLocation));
      return;
    }
    // Fallback: try to find by ID in nearby/search results
    if (preselectedBusinessId) {
      const nearbyMatch = nearbyLocations.find((loc) => loc.id === preselectedBusinessId);
      if (nearbyMatch) {
        setSelectedLocation(toParticipating(nearbyMatch));
        return;
      }
      const searchMatch = searchResults.find((loc) => loc.business_id === preselectedBusinessId);
      if (searchMatch) {
        setSelectedLocation(searchMatch);
      }
    }
  }, [preselectedLocationData, preselectedLocation, preselectedBusinessId, nearbyLocations, searchResults, selectedLocation]);

  // ──────────────────────────────────────────────────
  // Derived state
  // ──────────────────────────────────────────────────
  const showImageUpload = requiresImage || riskLevel.requiresImage;

  // ──────────────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const purchaseDateTooOld = purchaseDate !== '' && purchaseDate < sevenDaysAgo;

  const isFormValid =
    selectedLocation &&
    receiptIdentifier.trim().length > 0 &&
    transactionAmount.trim().length > 0 &&
    parseFloat(transactionAmount) > 0 &&
    purchaseDate !== '' &&
    !purchaseDateTooOld &&
    (!showImageUpload || receiptImageUrl !== null);

  // ──────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────
  const handleLocationSelect = (location: ParticipatingLocation | NearbyLocation) => {
    const participatingLocation =
      'business_id' in location ? (location as ParticipatingLocation) : toParticipating(location as NearbyLocation);
    setSelectedLocation(participatingLocation);
    setSearchTerm('');
    setErrorMessage('');
  };

  const handleChangeLocation = () => {
    userChangedLocation.current = true;
    setSelectedLocation(null);
    setSearchTerm('');
    setErrorMessage('');
    receiptKeystrokeTimesRef.current = [];
    setReceiptWasPasted(false);
    setRequiresImage(false);
    setReceiptImageUrl(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTransactionAmount(value);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid || !selectedLocation) return;

    setErrorMessage('');
    const amount = parseFloat(transactionAmount);
    const times = receiptKeystrokeTimesRef.current;
    let typingDurationMs: number | undefined;
    if (times.length >= 4) {
      let min = Infinity;
      for (let i = 0; i <= times.length - 4; i++) {
        min = Math.min(min, times[i + 3] - times[i]);
      }
      typingDurationMs = min;
    }
    const receiptInputMethod = receiptWasPasted ? 'pasted' : 'typed';

    submitReceiptEntry.mutate({
      locationId: selectedLocation.location_id,
      receiptIdentifier: receiptIdentifier.trim(),
      transactionAmount: amount,
      transactionDate: purchaseDate,
      receiptImageUrl: receiptImageUrl ?? undefined,
      typingDurationMs,
      receiptInputMethod,
    });
  };

  // ──────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Draw cap reached ─────────────────────────── */}
      {riskLevel.isDrawCapped && (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #195DE2 0%, #7FA6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEvents sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>
              You're maxed out for this campaign! 🎉
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              You've submitted all <strong>30 entries</strong> for this campaign. That's the maximum - sit back and wait for the results. Good luck!
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Daily receipt limit (5/day for all users) ── */}
      {!riskLevel.isDrawCapped && riskLevel.isDailyLimitReached && !riskLevel.isThrottled && (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AccessTime sx={{ fontSize: 26, color: 'text.secondary' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
              Daily limit reached
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              You've used your entries for today. Come back tomorrow - or claim your free weekly entry below.
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Throttled (high-risk user, 1/day) ───────── */}
      {!riskLevel.isDrawCapped && riskLevel.isThrottled && (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccessTime sx={{ fontSize: 26, color: 'text.secondary' }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
              Daily entry limit reached
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              You've used your entries for today. Come back tomorrow - or claim your free weekly entry below.
            </Typography>
          </Box>
        </Box>
      )}

      {!riskLevel.isDrawCapped && !riskLevel.isThrottled && !riskLevel.isDailyLimitReached && <>

      {/* ── Step 1: Select Business ─────────────────── */}
      {!selectedLocation && isLocationFetching && (
        <Box sx={{ mb: 2 }}>
          <Skeleton variant='rounded' height={48} sx={{ borderRadius: 2.5, mb: 1 }} />
          <Skeleton variant='rounded' height={56} sx={{ borderRadius: 2.5 }} />
        </Box>
      )}
      {!selectedLocation && !isLocationFetching && (
        <BusinessSelector
          primaryColor={primaryColor}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          debouncedTerm={debouncedTerm}
          isSearching={isSearching}
          searchResults={searchResults}
          nearbyLocations={nearbyLocations}
          onLocationSelect={handleLocationSelect}
        />
      )}

      {/* ── Selected location pill ───────────────────── */}
      {selectedLocation && !successDialogOpen && (
        <SelectedLocationPill
          primaryColor={primaryColor}
          location={selectedLocation}
          onChangeLocation={handleChangeLocation}
        />
      )}

      {/* ── Receipt example dialog ──────────────────── */}
      <Dialog open={exampleOpen} onClose={() => setExampleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontWeight: 800, fontSize: '1.1rem', color: 'text.primary',
            borderBottom: '1px solid', borderColor: 'divider',
          }}
        >
          Receipt Example
          <IconButton
            onClick={() => setExampleOpen(false)}
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: '#fff' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}>
            Use this to find the unique number on your receipt
          </Typography>
          {selectedLocation?.receipt_example_image_url && (
            <Box component="img" src={selectedLocation.receipt_example_image_url} alt="Receipt example"
              sx={{ display: 'block', width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 2 }} />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Receipt fields ───────────────────────────── */}
      <Collapse in={Boolean(selectedLocation) && !successDialogOpen}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Step 2 label */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%',
              bgcolor: primaryColor || PRIMARY_MAIN,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Typography sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>2</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Enter receipt details
            </Typography>
          </Box>

          {/* Receipt ID */}
          <TextField
            fullWidth
            label="Receipt / Transaction ID"
            placeholder="e.g. RCP-12345"
            value={receiptIdentifier}
            onChange={(e) => {
              const val = e.target.value;
              setReceiptIdentifier(val);
              if (val === '') {
                receiptKeystrokeTimesRef.current = [];
                setReceiptWasPasted(false);
              }
            }}
            onKeyDown={() => {
              receiptKeystrokeTimesRef.current.push(Date.now());
            }}
            onPaste={() => {
              setReceiptWasPasted(true);
              receiptKeystrokeTimesRef.current = [];
            }}
            helperText={
              <Box component="span">
                Find this on your receipt - may say "Receipt #" or "Order #"
                {selectedLocation?.receipt_example_image_url && (
                  <>
                    {' · '}
                    <Box component="span" onClick={() => setExampleOpen(true)}
                      sx={{ color: primaryColor || PRIMARY_MAIN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      Can't find it? See example
                    </Box>
                  </>
                )}
              </Box>
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptOutlined sx={{ fontSize: 20, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&.Mui-focused fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: primaryColor || PRIMARY_MAIN },
            }}
          />

          {/* Amount */}
          <TextField
            fullWidth
            label="Amount spent"
            placeholder="0.00"
            value={transactionAmount}
            onChange={handleAmountChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '1.05rem', lineHeight: 1 }}>$</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&.Mui-focused fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: primaryColor || PRIMARY_MAIN },
            }}
          />

          {/* Entry count preview */}
          {selectedLocation?.min_transaction_amount && parseFloat(transactionAmount) > 0 && (() => {
            const min = selectedLocation.min_transaction_amount!;
            const count = Math.min(Math.floor(parseFloat(transactionAmount) / min), 10);
            if (count <= 0) return null;
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {count === 1
                    ? `Earns 1 entry (min $${min})`
                    : `Earns ${count} entries ($${min} each)`}
                </Typography>
              </Box>
            );
          })()}

          {/* Purchase Date */}
          <TextField
            fullWidth
            label="Date of purchase"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            inputProps={{ max: today, min: sevenDaysAgo }}
            InputLabelProps={{ shrink: true }}
            error={purchaseDateTooOld}
            helperText={purchaseDateTooOld ? 'Receipt is older than 7 days and cannot be accepted.' : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                '&.Mui-focused fieldset': { borderColor: primaryColor || PRIMARY_MAIN },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: primaryColor || PRIMARY_MAIN },
            }}
          />

          {/* Receipt image upload */}
          {showImageUpload && (
            <ReceiptImageUploadField
              primaryColor={primaryColor}
              receiptImageUrl={receiptImageUrl}
              setReceiptImageUrl={setReceiptImageUrl}
              isUploading={receiptImageUpload.isUploading}
              uploadError={receiptImageUpload.error}
              onUpload={receiptImageUpload.upload}
            />
          )}

          {/* Error */}
          {errorMessage && (
            <Box sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              p: 2, borderRadius: 2.5,
              bgcolor: '#fef2f2', border: '1px solid #fecaca',
            }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1, mt: 0.1 }}>⚠️</Typography>
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 500, lineHeight: 1.5 }}>
                {errorMessage}
              </Typography>
            </Box>
          )}

          {/* Submit */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={!isFormValid || submitReceiptEntry.isPending || riskLevel.isThrottled || riskLevel.isDailyLimitReached}
            sx={{
              mt: 0.5,
              height: 52,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: 0.3,
              textTransform: 'none',
              bgcolor: primaryColor || PRIMARY_MAIN,
              boxShadow: `0 4px 20px ${primaryColor || PRIMARY_MAIN}45`,
              transition: 'transform 160ms ease-out, box-shadow 160ms ease-out, filter 160ms ease-out',
              '&:hover': {
                bgcolor: primaryColor || PRIMARY_MAIN,
                filter: 'brightness(0.9)',
                boxShadow: `0 6px 24px ${primaryColor || PRIMARY_MAIN}55`,
                transform: 'translateY(-1px)',
              },
              '&:active': { transform: 'scale(0.97)' },
              '&:disabled': { opacity: 0.45, boxShadow: 'none', transform: 'none' },
            }}
          >
            {submitReceiptEntry.isPending ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Submitting…</span>
              </Box>
            ) : (
              'Submit Entry'
            )}
          </Button>
        </Box>
      </Collapse>

      </>}

      <EntrySuccessDialog
        open={successDialogOpen}
        submittedCode={submittedCode}
        submittedEntryCount={submittedEntryCount}
        primaryColor={primaryColor}
        onViewEntries={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
        onSubmitAnother={() => setSuccessDialogOpen(false)}
      />
    </Box>
  );
};

export default ReceiptEntryForm;
