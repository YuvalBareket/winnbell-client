import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Zoom,
} from '@mui/material';
import { AccessTime, CardGiftcard, CloudUpload, ChevronRight, Close, ConfirmationNumber, EmojiEvents, InfoOutlined, ReceiptOutlined, StorefrontOutlined, Visibility, AddCircleOutline } from '@mui/icons-material';
import { useUploadReceiptImage } from '../hooks/useUploadReceiptImage';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import { PRIMARY_MAIN, GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';
import { getNearbyBusinesses } from '../../nearBy/api/nearBy.api';
import { useSearchParticipatingLocations } from '../hooks/useAllParticipatingLocations';
import { useSubmitReceiptEntry } from '../hooks/useSubmitReceiptEntry';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

interface ReceiptEntryFormProps {
  primaryColor: string;
  preselectedBusinessId?: number;
  onSuccess?: (ticketId: number) => void;
  onError?: (message: string) => void;
}

const toParticipating = (n: NearbyLocation): ParticipatingLocation => ({
  location_id: n.location_id,
  location_name: n.name,
  address: n.address,
  business_id: n.id,
  business_name: n.name,
  sector: n.sector,
  logo_url: n.logo_url,
  min_transaction_amount: null,
});

const ReceiptEntryForm: React.FC<ReceiptEntryFormProps> = ({
  primaryColor,
  preselectedBusinessId,
  onSuccess,
  onError,
}) => {
  // ──────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<ParticipatingLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState<NearbyLocation[]>([]);
  const [receiptIdentifier, setReceiptIdentifier] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptFirstKeystrokeAt, setReceiptFirstKeystrokeAt] = useState<number | null>(null);
  const [receiptLastKeystrokeAt, setReceiptLastKeystrokeAt] = useState<number | null>(null);
  const [receiptWasPasted, setReceiptWasPasted] = useState(false);
  const [requiresImage, setRequiresImage] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  // ──────────────────────────────────────────────────
  // Hooks
  // ──────────────────────────────────────────────────
  const navigate = useNavigate();
  const riskLevel = useMyRiskLevel();
  const { data: searchResults = [], isFetching: isSearching } = useSearchParticipatingLocations(debouncedTerm);
  const receiptImageUpload = useUploadReceiptImage();

  const submitReceiptEntry = useSubmitReceiptEntry({
    onSuccess: (data) => {
      setSubmittedCode(data.code ?? null);
      setSuccessDialogOpen(true);
      setReceiptIdentifier('');
      setTransactionAmount('');
      setErrorMessage('');
      setReceiptFirstKeystrokeAt(null);
      setReceiptLastKeystrokeAt(null);
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
      } else {
        setErrorMessage(message);
      }
      onError?.(message);
    },
  });

  // ──────────────────────────────────────────────────
  // Debounce search term (350ms)
  // ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ──────────────────────────────────────────────────
  // Fetch nearby locations on mount
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearby = await getNearbyBusinesses({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            radius: 5,
          });
          setNearbyLocations(nearby.slice(0, 2));
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

  // Auto-select location if preselected
  useEffect(() => {
    if (preselectedBusinessId && !selectedLocation) {
      // Try to find in nearby locations first
      const nearbyMatch = nearbyLocations.find((loc) => loc.id === preselectedBusinessId);
      if (nearbyMatch) {
        setSelectedLocation(toParticipating(nearbyMatch));
        return;
      }
      // Try to find in search results
      const searchMatch = searchResults.find((loc) => loc.business_id === preselectedBusinessId);
      if (searchMatch) {
        setSelectedLocation(searchMatch);
      }
    }
  }, [preselectedBusinessId, nearbyLocations, searchResults, selectedLocation]);

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
    setSelectedLocation(null);
    setSearchTerm('');
    setErrorMessage('');
    setReceiptFirstKeystrokeAt(null);
    setReceiptLastKeystrokeAt(null);
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
    const typingDurationMs =
      receiptFirstKeystrokeAt != null && receiptLastKeystrokeAt != null
        ? receiptLastKeystrokeAt - receiptFirstKeystrokeAt
        : undefined;
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

      {/* ── Daily Limit ─────────────────────────────── */}
      {riskLevel.isThrottled && (
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
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
              You've used your entries for today. Come back tomorrow — or claim your free weekly ticket below.
            </Typography>
          </Box>
        </Box>
      )}

      {!riskLevel.isThrottled && <>

      {/* ── Step 1: Select Business ─────────────────── */}
      {!selectedLocation && (
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
                borderRadius: 2.5,
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
                  <LocationCard key={loc.location_id} location={loc} primaryColor={primaryColor} onSelect={handleLocationSelect} />
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
                <NearbyLocationCard key={loc.location_id} location={loc} primaryColor={primaryColor} onSelect={handleLocationSelect} distanceKm={loc.distance_km} />
              ))}
            </>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Start typing to find a business</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Selected location pill ───────────────────── */}
      {selectedLocation && !successDialogOpen && (
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
              width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
              bgcolor: primaryColor || PRIMARY_MAIN,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <StorefrontOutlined sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
              {selectedLocation.business_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {selectedLocation.address}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleChangeLocation}
            sx={{
              color: primaryColor || PRIMARY_MAIN, fontWeight: 700,
              fontSize: '0.75rem', minWidth: 'auto', px: 1.5,
              borderRadius: 1.5,
              '&:hover': { bgcolor: `${primaryColor || PRIMARY_MAIN}15` },
            }}
          >
            Change
          </Button>
        </Box>
      )}

      {/* ── Threshold info banner ──────────────────────── */}
      {selectedLocation && selectedLocation.min_transaction_amount && !successDialogOpen && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1.25, mb: 2, borderRadius: 2,
            bgcolor: `${primaryColor || PRIMARY_MAIN}08`,
            border: `1px solid ${primaryColor || PRIMARY_MAIN}20`,
          }}
        >
          <InfoOutlined sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 18, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.4 }}>
            Earn 1 entry per ${selectedLocation.min_transaction_amount} spent
            {' '}&middot;{' '}
            ${selectedLocation.min_transaction_amount * 2} = 2 entries
          </Typography>
        </Box>
      )}

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
                setReceiptFirstKeystrokeAt(null);
                setReceiptLastKeystrokeAt(null);
                setReceiptWasPasted(false);
              }
            }}
            onKeyDown={() => {
              const now = Date.now();
              if (receiptFirstKeystrokeAt === null) setReceiptFirstKeystrokeAt(now);
              setReceiptLastKeystrokeAt(now);
            }}
            onPaste={() => setReceiptWasPasted(true)}
            helperText='Find this on your receipt — may say "Receipt #" or "Order #"'
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
            <Box>
              <input
                id="receipt-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await receiptImageUpload.upload(file);
                  if (url) setReceiptImageUrl(url);
                }}
              />
              <Box
                component="label"
                htmlFor="receipt-image-input"
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  p: 2, borderRadius: 2.5,
                  border: '1.5px dashed',
                  borderColor: receiptImageUrl ? '#16a34a' : `${primaryColor || PRIMARY_MAIN}50`,
                  bgcolor: receiptImageUrl ? '#f0fdf4' : `${primaryColor || PRIMARY_MAIN}06`,
                  cursor: receiptImageUpload.isUploading ? 'wait' : 'pointer',
                  transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
                  '&:hover': {
                    borderColor: receiptImageUrl ? '#16a34a' : primaryColor || PRIMARY_MAIN,
                    bgcolor: receiptImageUrl ? '#dcfce7' : `${primaryColor || PRIMARY_MAIN}10`,
                  },
                }}
              >
                {receiptImageUpload.isUploading ? (
                  <>
                    <CircularProgress size={22} sx={{ color: primaryColor || PRIMARY_MAIN, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Uploading…</Typography>
                      <Typography variant="caption" color="text.secondary">Please wait</Typography>
                    </Box>
                  </>
                ) : receiptImageUrl ? (
                  <>
                    <Box sx={{ width: 40, height: 40, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, border: '2px solid #16a34a' }}>
                      <Box component="img" src={receiptImageUrl} alt="receipt" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d' }}>Receipt attached</Typography>
                      <Typography variant="caption" sx={{ color: '#16a34a' }}>Tap to replace</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.preventDefault(); setPreviewOpen(true); }}
                      sx={{ color: '#15803d', bgcolor: '#dcfce7', '&:hover': { bgcolor: '#bbf7d0' } }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                      bgcolor: `${primaryColor || PRIMARY_MAIN}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CloudUpload sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Attach receipt photo</Typography>
                      <Typography variant="caption" color="text.secondary">Tap to take a photo or upload from gallery</Typography>
                    </Box>
                  </>
                )}
              </Box>
              {receiptImageUpload.error && (
                <Typography variant="caption" color="error" sx={{ mt: 0.75, display: 'block', pl: 0.5 }}>
                  {receiptImageUpload.error}
                </Typography>
              )}
            </Box>
          )}

          {/* Receipt preview dialog */}
          <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
            <DialogContent sx={{ p: 1, position: 'relative', bgcolor: '#000' }}>
              <IconButton
                onClick={() => setPreviewOpen(false)}
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}
              >
                <Close fontSize="small" />
              </IconButton>
              {receiptImageUrl && (
                <Box component="img" src={receiptImageUrl} alt="Receipt preview" sx={{ width: '100%', display: 'block', borderRadius: 0.5 }} />
              )}
            </DialogContent>
          </Dialog>

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
            disabled={!isFormValid || submitReceiptEntry.isPending || riskLevel.isThrottled}
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

      {/* ── Free Weekly Ticket ──────────────────────── */}
      <Divider sx={{ my: 1 }} />
      <Paper
        elevation={0}
        onClick={() => navigate('/freeTicket')}
        sx={{
          p: 1.5, px: 2, borderRadius: 3,
          bgcolor: `${primaryColor || PRIMARY_MAIN}0A`,
          border: `1px solid ${primaryColor || PRIMARY_MAIN}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 1.5,
          transition: 'background-color 150ms ease-out, transform 150ms ease-out',
          '&:hover': { bgcolor: `${primaryColor || PRIMARY_MAIN}14`, transform: 'translateY(-2px)' },
          '&:active': { transform: 'scale(0.97)' },
        }}
      >
        <Box sx={{ bgcolor: primaryColor || PRIMARY_MAIN, borderRadius: 1.5, p: 0.75, display: 'flex', color: 'white' }}>
          <CardGiftcard fontSize="small" />
        </Box>
        <Stack flex={1} spacing={0.25}>
          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>Free Weekly Ticket</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>Claim 1 free entry</Typography>
        </Stack>
        <ChevronRight sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 20 }} />
      </Paper>

      {/* ── Success Dialog ───────────────────────────── */}
      <Dialog
        open={successDialogOpen}
        fullScreen
        TransitionComponent={Fade}
        PaperProps={{ sx: { bgcolor: 'transparent' } }}
      >
        <Box sx={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
        }}>
          <Zoom in={successDialogOpen} timeout={400}>
            <Box sx={{
              width: 100, height: 100, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 3, border: '2px solid rgba(255,255,255,0.3)',
            }}>
              <EmojiEvents sx={{ fontSize: 52, color: GOLD_TROPHY }} />
            </Box>
          </Zoom>
          <Fade in={successDialogOpen} timeout={600}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
                You're In!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
                Your entry is in the draw.<br />Good luck!
              </Typography>
              {submittedCode && (
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3, px: 4, py: 2.5, mb: 5, display: 'inline-block',
                }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                    Entry Code
                  </Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                    {submittedCode}
                  </Typography>
                </Box>
              )}
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ConfirmationNumber />}
                  onClick={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
                  sx={{ bgcolor: 'white', color: primaryColor, fontWeight: 800, borderRadius: 3, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  View My Tickets
                </Button>
                <Button
                  variant="text"
                  startIcon={<AddCircleOutline />}
                  onClick={() => setSuccessDialogOpen(false)}
                  sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}
                >
                  Submit Another Receipt
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Box>
      </Dialog>
    </Box>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// Subcomponents
// ══════════════════════════════════════════════════════════════════════════════

interface LocationCardProps {
  location: ParticipatingLocation;
  primaryColor: string;
  onSelect: (location: ParticipatingLocation) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, primaryColor, onSelect }) => (
  <Box
    onClick={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.75, mb: 1, borderRadius: 2.5,
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
      width: 38, height: 38, borderRadius: 1.5, flexShrink: 0,
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

const NearbyLocationCard: React.FC<NearbyLocationCardProps> = ({ location, primaryColor, onSelect, distanceKm }) => (
  <Box
    onClick={() => onSelect(location)}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      p: 1.75, mb: 1, borderRadius: 2.5,
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
      width: 38, height: 38, borderRadius: 1.5, flexShrink: 0,
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

export default ReceiptEntryForm;
