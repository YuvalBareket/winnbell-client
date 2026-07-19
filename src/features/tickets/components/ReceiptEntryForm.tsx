import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { MAX_ENTRIES_PER_DRAW } from '../../../shared/constants/entries';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AttractButton from '../../../shared/components/AttractButton';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessTime, Close, EmojiEvents, ReceiptOutlined, EventBusy, GppGood, CheckCircle, CardGiftcardOutlined, StarRounded, ArrowForwardRounded } from '@mui/icons-material';
import { useUploadReceiptImage } from '../hooks/useUploadReceiptImage';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import {
  PRIMARY_MAIN, PRIMARY_LIGHT, PRIMARY_DEEP, GRADIENT_PRIMARY, GRADIENT_FREE_CARD,
  ACCENT_GOLD, ACCENT_GOLD_DARK, SUCCESS_GREEN, TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT,
} from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import { staggerContainer, riseIn, popIn, pressable, pressableCard, SPRING_SNAPPY } from '../../../shared/motion';
import EntrySuccessDialog from './EntrySuccessDialog';
import ReceiptImageUploadField from './ReceiptImageUploadField';
import BusinessSelector from './BusinessSelector';
import SelectedLocationPill from './SelectedLocationPill';
import { getNearbyBusinesses } from '../../nearBy/api/nearBy.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { MAX_ENTRIES_PER_RECEIPT } from '../../../shared/constants/entries';
import { useSearchParticipatingLocations } from '../hooks/useAllParticipatingLocations';
import { useSubmitReceiptEntry } from '../hooks/useSubmitReceiptEntry';
import { fetchParticipatingLocationById } from '../api/ticketsApi';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation, NearbyLocationDetail } from '../../nearBy/types/nearBy.types';

// Safari anti-zoom: 16px keeps mobile Safari from auto-zooming the viewport on focus.
// Hoisted at module level so the factory is not re-created per render.
// Device-level "don't show again" for the before-you-submit confirmation dialog.
const SKIP_SUBMIT_CONFIRM_KEY = 'skipSubmitConfirm';

const receiptFieldSx = (accentColor: string) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    '&.Mui-focused fieldset': { borderColor: accentColor },
  },
  // 16px keeps mobile Safari from auto-zooming the viewport on focus.
  '& .MuiOutlinedInput-input': { fontSize: '16px' },
  '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
});

interface ReceiptEntryFormProps {
  primaryColor: string;
  preselectedBusinessId?: number;
  preselectedLocation?: NearbyLocation | NearbyLocationDetail;
  preselectedLocationId?: number;
  onSuccess?: (ticketId: number) => void;
  onError?: (message: string) => void;
  onLocationSelect?: (hasLocation: boolean) => void;
  // Entry gate hook (phone verification): called with the submit continuation so the parent
  // can interpose the verify sheet before the entry is created. Runs the action directly
  // when absent or already satisfied.
  guardEntryAction?: (proceed: () => void) => void;
}

// Accepts either the compact NearbyLocation (name/id) OR the profile detail shape
// (business_name/location_name/business_id) - the map drawer passes the latter, so read both.
const toParticipating = (n: NearbyLocation | NearbyLocationDetail): ParticipatingLocation => {
  const d = n as Partial<NearbyLocationDetail> & NearbyLocation;
  return {
    location_id: n.location_id,
    location_name: d.location_name ?? n.name,
    address: n.address,
    business_id: d.business_id ?? n.id,
    business_name: d.business_name ?? n.name,
    sector: n.sector,
    logo_url: n.logo_url,
    receipt_example_image_url: 'receipt_example_image_url' in n ? (n as any).receipt_example_image_url : null,
    min_transaction_amount: 'min_transaction_amount' in n ? (n as any).min_transaction_amount : null,
  };
};

// ── Step indicator: (1) Business ——— (2) Receipt ────────────────────────────
// Exported so RedeemPage can place it in the desktop header-card actions.
export const StepIndicator: React.FC<{ step: 1 | 2 }> = ({ step }) => {
  const dot = (active: boolean, done: boolean, label: string, num: string) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
      {/* Keyed by state so flipping 1 -> check (or back) pops the dot. */}
      <motion.div
        key={`${done}-${active}`}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={SPRING_SNAPPY}
      >
        <Box sx={{
          width: 26, height: 26, borderRadius: '50%',
          bgcolor: done ? SUCCESS_GREEN : active ? PRIMARY_MAIN : 'action.hover',
          color: done || active ? '#fff' : TEXT_SECONDARY,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 800,
        }}>
          {done ? <CheckCircle sx={{ fontSize: 18 }} /> : num}
        </Box>
      </motion.div>
      <Typography variant='body2' sx={{ fontWeight: 800, color: active || done ? TEXT_HEADING : TEXT_SECONDARY }}>
        {label}
      </Typography>
    </Box>
  );
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: { md: 220 } }}>
      {dot(step === 1, step === 2, 'Business', '1')}
      {/* Connector sweeps left-to-right as step 1 completes (scaleX = compositor-only). */}
      <Box sx={{ flex: 1, height: 2, borderRadius: 1, bgcolor: BORDER_LIGHT, overflow: 'hidden' }}>
        <motion.div
          initial={false}
          animate={{ scaleX: step === 2 ? 1 : 0 }}
          transition={SPRING_SNAPPY}
          style={{ height: '100%', background: PRIMARY_MAIN, transformOrigin: 'left' }}
        />
      </Box>
      {dot(step === 2, false, 'Receipt', '2')}
    </Box>
  );
};

// ── Blue free-weekly-entry card. Two shapes to match the design frames:
//    'full'    = desktop right-rail card with a Claim button (frame-0)
//    'compact' = mobile single tappable row with an arrow (frame-2)
// The card itself is the page's single attractor: a soft blue glow pulses to pull the eye.
// Transition stays inline so spreading a gesture ({...pressableCard}) never kills the loop.
const attractGlow = {
  animate: { boxShadow: [`0 1px 5px ${alpha(PRIMARY_MAIN, 0.06)}`, `0 5px 14px ${alpha(PRIMARY_MAIN, 0.20)}`, `0 1px 5px ${alpha(PRIMARY_MAIN, 0.06)}`] },
  transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const },
};

const FreeEntryCard: React.FC<{ onClaim: () => void; variant?: 'full' | 'compact' }> = ({ onClaim, variant = 'full' }) => {
  const blue = {
    background: GRADIENT_FREE_CARD,
    border: `1px solid ${PRIMARY_LIGHT}55`,
  };
  const iconChip = (
    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${PRIMARY_MAIN}18`, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <CardGiftcardOutlined sx={{ fontSize: 22 }} />
    </Box>
  );

  if (variant === 'compact') {
    return (
      <Box
        component={motion.div}
        {...pressableCard}
        {...attractGlow}
        onClick={onClaim}
        sx={{ ...blue, display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 3, cursor: 'pointer' }}
      >
        {iconChip}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='body2' sx={{ fontWeight: 800, color: PRIMARY_DEEP, lineHeight: 1.2 }}>Claim weekly entry</Typography>
          <Typography variant='caption' sx={{ color: PRIMARY_MAIN, opacity: 0.85, display: 'block', lineHeight: 1.3 }}>No purchase needed. Resets Every Sunday.</Typography>
        </Box>
        <ArrowForwardRounded sx={{ color: PRIMARY_MAIN, flexShrink: 0 }} />
      </Box>
    );
  }

  return (
    <Box component={motion.div} {...attractGlow} sx={{ ...blue, borderRadius: 3, px: 3, py: 3.5, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Large prize icon on top so the card sits taller */}
      <Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: 'white', color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <CardGiftcardOutlined sx={{ fontSize: 36 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, color: PRIMARY_DEEP, fontSize: '1rem' }}>No receipt today?</Typography>
      <Typography sx={{ color: PRIMARY_MAIN, opacity: 0.9, lineHeight: 1.5, mt: 1, fontSize: '0.8125rem' }}>
        Claim your weekly entry. One on us, every week, no purchase needed.
      </Typography>
      <motion.div {...pressable} style={{ width: '100%' }}>
        <Button
          fullWidth
          onClick={onClaim}
          startIcon={<StarRounded sx={{ fontSize: 18 }} />}
          sx={{ mt: 2.5, height: 44, borderRadius: 2, fontWeight: 800, textTransform: 'none', color: '#fff', background: GRADIENT_PRIMARY, '&:hover': { background: GRADIENT_PRIMARY, filter: 'brightness(0.96)' } }}
        >
          Claim weekly entry
        </Button>
      </motion.div>
      <Typography sx={{ mt: 1.25, color: PRIMARY_MAIN, opacity: 0.7, fontSize: '0.72rem' }}>
        Resets Every Sunday
      </Typography>
    </Box>
  );
};

const ReceiptEntryForm: React.FC<ReceiptEntryFormProps> = ({
  primaryColor,
  preselectedLocation,
  preselectedLocationId,
  onSuccess,
  onError,
  onLocationSelect,
  guardEntryAction,
}) => {
  // ──────────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────────
  const [selectedLocation, setSelectedLocation] = useState<ParticipatingLocation | null>(null);
  const [selectedLocationCapReached, setSelectedLocationCapReached] = useState(false);
  const userChangedLocation = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
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
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  // "Don't show again" for the before-you-submit dialog: device-level preference,
  // saved only when the user actually submits with the box checked.
  const [skipConfirmChecked, setSkipConfirmChecked] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 350);
  // Tracks whether the partial-object branch has already auto-selected a location so it
  // does not re-run on every render. The authoritative-fetch branch intentionally bypasses
  // this guard so it can UPGRADE an already-set partial object once the real data lands.
  const hasAutoSelected = useRef(false);

  // ──────────────────────────────────────────────────
  // Hooks
  // ──────────────────────────────────────────────────
  const navigate = useNavigate();
  const riskLevel = useMyRiskLevel();
  const { data: searchResults = [], isFetching: isSearching } = useSearchParticipatingLocations(debouncedTerm);
  const receiptImageUpload = useUploadReceiptImage();

  // Always resolve the AUTHORITATIVE participating detail by location id - it carries the real
  // business/location name and min_transaction_amount, which the compact object passed from the
  // map drawer may lack (that caused a blank name and a wrong "1 entry" estimate).
  const resolvedLocationId = preselectedLocationId ?? preselectedLocation?.location_id;
  const { data: preselectedLocationData, isFetching: isLocationFetching } = useQuery({
    queryKey: [...queryKeys.participating.all, 'location', resolvedLocationId],
    queryFn: () => fetchParticipatingLocationById(resolvedLocationId!),
    enabled: !!resolvedLocationId,
    staleTime: 5 * 60_000,
  });

  // The "near you" quick-picks come from the map's nearby endpoint, whose payload is
  // deliberately budget-capped and carries NO min_transaction_amount. Without it the
  // entries preview always says 1 while the server computes floor(amount / min).
  // Resolve the authoritative detail for such picks (same key/cache as the QR path above).
  const selectedMissingMin = !!selectedLocation && selectedLocation.min_transaction_amount == null;
  const { data: selectedLocationDetail } = useQuery({
    queryKey: [...queryKeys.participating.all, 'location', selectedLocation?.location_id],
    queryFn: () => fetchParticipatingLocationById(selectedLocation!.location_id),
    enabled: selectedMissingMin,
    staleTime: 5 * 60_000,
  });

  const submitReceiptEntry = useSubmitReceiptEntry();

  // onLocationSelect is called inline in handlers and in the auto-select effect above.
  // onBlockedChange had no consumer in RedeemPage (verified by grep) and has been removed.

  // ──────────────────────────────────────────────────
  // Fetch nearby locations on mount (geolocation → React Query)
  // ──────────────────────────────────────────────────
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeoCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => { /* silent failure */ },
      { timeout: 8000 },
    );
  }, []);

  const { data: nearbyLocations = [] } = useQuery<NearbyLocation[]>({
    queryKey: [...queryKeys.nearby.receipt,
      geoCoords ? Math.round(geoCoords.latitude * 1000) / 1000 : null,
      geoCoords ? Math.round(geoCoords.longitude * 1000) / 1000 : null,
    ],
    queryFn: () => {
      const lat = geoCoords!.latitude;
      const lng = geoCoords!.longitude;
      const radiusKm = 5;
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(lat * (Math.PI / 180)));
      return getNearbyBusinesses({
        minLat: lat - latDelta, maxLat: lat + latDelta,
        minLng: lng - lngDelta, maxLng: lng + lngDelta,
        limit: 2,
      });
    },
    enabled: !!geoCoords,
    staleTime: 60_000,
    gcTime: 2 * 60_000,
  });

  // Auto-select location if preselected (skip if user manually changed the selection).
  // selectedLocation is intentionally omitted from deps: the authoritative-fetch branch upgrades
  // regardless of current value, and the partial-object branch uses a ref guard instead of
  // depending on selectedLocation (which would cause a loop: set -> dep changes -> re-run -> set).
  useEffect(() => {
    if (userChangedLocation.current) return;
    // Authoritative fetched detail wins and UPGRADES an already-set partial object as soon as it
    // loads (real name + min_transaction_amount), so we do not check hasAutoSelected here.
    if (preselectedLocationData) {
      setSelectedLocation(preselectedLocationData);
      onLocationSelect?.(true);
      hasAutoSelected.current = true;
      return;
    }
    // Show the object passed directly (e.g. from the NearBy drawer) immediately while the fetch loads.
    // Guard with hasAutoSelected so this branch only fires once, not on every parent render.
    if (preselectedLocation && !hasAutoSelected.current) {
      setSelectedLocation(toParticipating(preselectedLocation));
      setSelectedLocationCapReached(!!('cap_reached' in preselectedLocation && preselectedLocation.cap_reached));
      onLocationSelect?.(true);
      hasAutoSelected.current = true;
    }
    // No business-id-only fallback: a business id alone can't identify WHICH branch of a
    // multi-location business the user meant.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedLocationData, preselectedLocation]);

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
    receiptIdentifier.trim().length >= 5 &&
    transactionAmount.trim().length > 0 &&
    parseFloat(transactionAmount) > 0 &&
    purchaseDate !== '' &&
    !purchaseDateTooOld &&
    (!showImageUpload || receiptImageUrl !== null);

  // ──────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────
  const handleLocationSelect = (location: ParticipatingLocation | NearbyLocation) => {
    const isNearby = !('business_id' in location);
    const participatingLocation = isNearby ? toParticipating(location as NearbyLocation) : (location as ParticipatingLocation);
    setSelectedLocation(participatingLocation);
    setSelectedLocationCapReached(!!('cap_reached' in location && location.cap_reached));
    setSearchTerm('');
    setErrorMessage('');
    onLocationSelect?.(true);
  };

  const handleChangeLocation = () => {
    userChangedLocation.current = true;
    setSelectedLocation(null);
    setSelectedLocationCapReached(false);
    setSearchTerm('');
    setErrorMessage('');
    receiptKeystrokeTimesRef.current = [];
    setReceiptWasPasted(false);
    setRequiresImage(false);
    setReceiptImageUrl(null);
    onLocationSelect?.(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTransactionAmount(value);
    }
  };

  const handleSubmitClick = () => {
    if (!isFormValid || !selectedLocation) return;
    // Phone verification interposes here (before the confirm dialog), so by the time the
    // user confirms, the entry can actually be created.
    const proceed = () => {
      if (localStorage.getItem(SKIP_SUBMIT_CONFIRM_KEY) === '1') handleConfirmedSubmit();
      else setConfirmSubmitOpen(true);
    };
    if (guardEntryAction) guardEntryAction(proceed);
    else proceed();
  };

  const handleConfirmedSubmit = () => {
    if (!isFormValid || !selectedLocation) return;

    // Persist "don't show again" only on a real submit, never on Go Back.
    if (skipConfirmChecked) localStorage.setItem(SKIP_SUBMIT_CONFIRM_KEY, '1');
    setErrorMessage('');
    setConfirmSubmitOpen(false);
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
    }, {
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
        onSuccess?.(data.ticketId);
      },
      onError: (err) => {
        const message = apiErrorMessage(err, 'Submission failed. Please try again.');
        if (message === 'A receipt image is required to submit an entry.') {
          setRequiresImage(true);
          setErrorMessage('Please attach a photo of your receipt to continue.');
        } else {
          setErrorMessage(message);
        }
        onError?.(message);
      },
    });
  };

  // ──────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────

  // Entries this receipt would earn (for the desktop summary rail + preview).
  // Fall back to the fetched authoritative detail when the picked object lacks the minimum
  // (nearby quick-picks) so the preview always matches the server's entry math.
  const previewMin = selectedLocation?.min_transaction_amount
    ?? selectedLocationDetail?.min_transaction_amount
    ?? null;
  const previewAmt = parseFloat(transactionAmount);
  const previewCount = selectedLocation && previewAmt > 0
    ? (previewMin && previewMin > 0 ? Math.min(Math.floor(previewAmt / previewMin), MAX_ENTRIES_PER_RECEIPT) : 1)
    : 0;

  const canSubmit = isFormValid && !submitReceiptEntry.isPending && !riskLevel.isThrottled && !riskLevel.isDailyLimitReached;

  // Once every field is valid the CTA becomes the page's attractor and starts breathing.
  const renderSubmit = () => (
    <motion.div {...(canSubmit ? { ...pressable } : {})}>
    <AttractButton
      variant="contained"
      fullWidth
      onClick={handleSubmitClick}
      disabled={!canSubmit}
      endIcon={submitReceiptEntry.isPending ? undefined : <ArrowForwardRounded />}
      sx={{
        height: 52, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem', letterSpacing: 0.3, textTransform: 'none',
        bgcolor: primaryColor || PRIMARY_MAIN, boxShadow: `0 4px 20px ${primaryColor || PRIMARY_MAIN}45`,
        transition: 'transform 160ms ease-out, box-shadow 160ms ease-out, filter 160ms ease-out',
        '&:hover': { bgcolor: primaryColor || PRIMARY_MAIN, filter: 'brightness(0.9)', boxShadow: `0 6px 24px ${primaryColor || PRIMARY_MAIN}55`, transform: 'translateY(-1px)' },
        '&:active': { transform: 'scale(0.97)' },
        '&:disabled': { opacity: 0.45, boxShadow: 'none', transform: 'none' },
      }}
    >
      {submitReceiptEntry.isPending ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={18} color="inherit" />
          <span>Submitting...</span>
        </Box>
      ) : 'Submit & get my entries'}
    </AttractButton>
    </motion.div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Draw cap reached ─────────────────────────── */}
      {riskLevel.isDrawCapped && (
        <Box sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: '50%', background: GRADIENT_PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEvents sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mb: 0.5 }}>
              You're maxed out for this campaign! 
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              You've submitted all <strong>{MAX_ENTRIES_PER_DRAW} entries</strong> for this campaign. That's the maximum - sit back and wait for the results. Good luck!
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
              You've used your entries for today. Come back tomorrow - or claim your weekly entry below.
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
              You've used your entries for today. Come back tomorrow - or claim your weekly entry below.
            </Typography>
          </Box>
        </Box>
      )}

      {/* A daily receipt limit / throttle never blocks the separate free WEEKLY entry,
          so surface it here so the user always has a way to keep playing. */}
      {!riskLevel.isDrawCapped && (riskLevel.isDailyLimitReached || riskLevel.isThrottled) && !successDialogOpen && (
        <Box sx={{ mt: 2 }}>
          <FreeEntryCard variant='compact' onClaim={() => navigate('/freeTicket')} />
        </Box>
      )}

      {/* Step bar is desktop-only (rendered in the page header actions); mobile omits it. */}
      {!riskLevel.isDrawCapped && !riskLevel.isThrottled && !riskLevel.isDailyLimitReached && <>

      {/* ── Step 1: Select Business ─────────────────── */}
      {/* Stagger container remounts when the user returns from step 2, re-running the cascade. */}
      {!selectedLocation && (
        <Box component={motion.div} variants={staggerContainer} initial='hidden' animate='visible'>
          {/* Mobile: compact free-entry row above the search (frame-2) */}
          <Box component={motion.div} variants={riseIn} sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <FreeEntryCard variant='compact' onClaim={() => navigate('/freeTicket')} />
          </Box>

          {/* Mobile: "or submit a receipt instead" divider (frame-2) */}
          <Box component={motion.div} variants={riseIn} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: BORDER_LIGHT }} />
            <Typography sx={{ color: TEXT_SECONDARY, fontWeight: 700, fontSize: '0.7rem', letterSpacing: 0.6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Or submit a receipt instead
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: BORDER_LIGHT }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
            <Box component={motion.div} variants={riseIn} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
              {isLocationFetching ? (
                <Box sx={{ mb: 2 }}>
                  <Skeleton variant='rounded' height={48} sx={{ borderRadius: 2.5, mb: 1 }} />
                  <Skeleton variant='rounded' height={56} sx={{ borderRadius: 2.5 }} />
                </Box>
              ) : (
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
            </Box>
            {/* Desktop: full free-entry card in the right rail (frame-0). popIn is safe here -
                the 300px card never spans the viewport, so its scale overshoot can't zoom-flash. */}
            <Box component={motion.div} variants={popIn} sx={{ display: { xs: 'none', md: 'block' }, width: 300, flexShrink: 0 }}>
              <FreeEntryCard variant='full' onClaim={() => navigate('/freeTicket')} />
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Cap reached notice — replaces the entire form ── */}
      {selectedLocation && selectedLocationCapReached && !successDialogOpen && (
        <>
          <SelectedLocationPill primaryColor={primaryColor} location={selectedLocation} onChangeLocation={handleChangeLocation} />
          <Box sx={{
            p: 3, borderRadius: 2.5, textAlign: 'center',
            bgcolor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <EventBusy sx={{ fontSize: 32, color: 'rgba(245,158,11,0.8)' }} />
            <Typography variant='subtitle2' fontWeight={800} color='text.primary'>
              This location is full
            </Typography>
            <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
              This location has reached its entry limit for the current campaign. This is not your fault - try visiting another participating location.
            </Typography>
          </Box>
        </>
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

      {/* ── Step 2: Receipt details ─────────────────── */}
      <Collapse in={Boolean(selectedLocation) && !successDialogOpen && !selectedLocationCapReached}>
        {selectedLocation && (
        <Box
          component={motion.div}
          key={selectedLocation.location_id}
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}
        >
          {/* LEFT: selected location + fields */}
          <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
            <Box component={motion.div} variants={riseIn}>
              <SelectedLocationPill primaryColor={primaryColor} location={selectedLocation} onChangeLocation={handleChangeLocation} />
            </Box>
            <Box component={motion.div} variants={riseIn} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

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
            error={receiptIdentifier.trim().length > 0 && receiptIdentifier.trim().length < 5}
            helperText={
              <Box component="span">
                {receiptIdentifier.trim().length > 0 && receiptIdentifier.trim().length < 5
                  ? 'Minimum 5 characters'
                  : 'Find this on your receipt - may say "Receipt #" or "Order #"'}
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
            sx={receiptFieldSx(primaryColor || PRIMARY_MAIN)}
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
            sx={receiptFieldSx(primaryColor || PRIMARY_MAIN)}
          />

          {/* You'll earn N entries (design amber note). Springs in when the amount first
              crosses the minimum; the count itself pops on every change. */}
          <AnimatePresence initial={false}>
            {previewCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                transition={SPRING_SNAPPY}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderRadius: 2.5, bgcolor: `${ACCENT_GOLD}14`, border: `1px solid ${ACCENT_GOLD}40` }}>
                  <StarRounded sx={{ fontSize: 20, color: ACCENT_GOLD_DARK, flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ color: ACCENT_GOLD_DARK, fontWeight: 800, fontSize: '0.875rem', lineHeight: 1.3 }}>
                      You'll earn{' '}
                      <motion.span
                        key={previewCount}
                        style={{ display: 'inline-block' }}
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={SPRING_SNAPPY}
                      >
                        {previewCount} {previewCount === 1 ? 'entry' : 'entries'}
                      </motion.span>
                    </Typography>
                    {previewMin != null && previewMin > 0 && (
                      <Typography sx={{ color: ACCENT_GOLD_DARK, opacity: 0.85, fontSize: '0.75rem', lineHeight: 1.3 }}>
                        ${previewMin} per entry
                      </Typography>
                    )}
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

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
            sx={receiptFieldSx(primaryColor || PRIMARY_MAIN)}
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

              {/* Mobile submit (desktop submit lives in the summary rail) */}
              <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1 }}>
                {renderSubmit()}
              </Box>
            </Box>
          </Box>

          {/* RIGHT: summary + submit (desktop only). popIn: 300px rail, scale-safe. */}
          <Box component={motion.div} variants={popIn} sx={{ display: { xs: 'none', md: 'block' }, width: 300, flexShrink: 0, position: 'sticky', top: 16 }}>
            <Box sx={{ borderRadius: 3, border: `1px solid ${BORDER_LIGHT}`, bgcolor: 'background.paper', p: 2.5, mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: TEXT_SECONDARY, fontSize: '0.75rem', display: 'block', mb: 1.5 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>Business</Typography>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: TEXT_HEADING, textAlign: 'right', maxWidth: 170 }}>{selectedLocation.business_name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT_HEADING }}>{previewAmt > 0 ? `$${previewAmt.toFixed(2)}` : '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>Entries earned</Typography>
                {/* Keyed by count so every change hops - same trick as the My Entries number. */}
                <motion.span
                  key={previewCount}
                  style={{ display: 'inline-block' }}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={SPRING_SNAPPY}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, color: previewCount > 0 ? SUCCESS_GREEN : TEXT_SECONDARY }}>{previewCount > 0 ? `+${previewCount}` : '-'}</Typography>
                </motion.span>
              </Box>
            </Box>
            {renderSubmit()}
          </Box>
        </Box>
        )}
      </Collapse>

      </>}

      {/* Confirmation Dialog — Premium Design */}
      <Dialog
        open={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        {/* Rich Gradient Header */}
        <Box
          sx={{
            background: GRADIENT_PRIMARY,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Soft glowing light accents (shine effect). Radial gradients, NOT filter:blur -
              blurred children break the dialog's rounded clipping and box-shadow on Android. */}
          <Box
            sx={{
              position: 'absolute',
              top: -70,
              right: -60,
              width: 230,
              height: 230,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              left: -70,
              width: 190,
              height: 190,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Icon container with elevated presentation */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <GppGood
              sx={{
                fontSize: 40,
                color: '#ffffff',
              }}
            />
          </Box>

          {/* Heading in white on gradient */}
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.5rem',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: -0.3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Before you submit
          </Typography>
        </Box>

        {/* Content with generous spacing */}
        <DialogContent
          sx={{
            pt: 3.5,
            pb: 3,
            px: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.75,
              mb: 2,
              fontWeight: 500,
            }}
          >
            Every winning receipt is reviewed by our team before we award a prize.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.75,
              fontWeight: 500,
            }}
          >
            Make sure your details are accurate. Submitting false or altered information will result in a permanent ban.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={skipConfirmChecked}
                onChange={(e) => setSkipConfirmChecked(e.target.checked)}
                size="small"
                sx={{ py: 0.5 }}
              />
            }
            label="Don't show this again"
            sx={{
              mt: 2,
              ml: -0.75,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'text.secondary',
              },
            }}
          />
        </DialogContent>

        {/* Action buttons with clear hierarchy */}
        <DialogActions
          sx={{
            gap: 1.5,
            p: 2.5,
            bgcolor: 'background.paper',
            flexDirection: 'row-reverse',
          }}
        >
          {/* Primary CTA: Prominent, gradient-inspired button */}
          <AttractButton
            onClick={handleConfirmedSubmit}
            variant="contained"
            disabled={submitReceiptEntry.isPending}
            sx={{
              flex: 1,
              whiteSpace: 'nowrap',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2.5,
              height: 48,
              bgcolor: primaryColor || PRIMARY_MAIN,
              color: '#ffffff',
              boxShadow: `0 6px 20px ${alpha(primaryColor || PRIMARY_MAIN, 0.4)}`,
              transition: 'all 180ms cubic-bezier(0.2, 0, 0, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              },
              '&:hover': {
                bgcolor: primaryColor || PRIMARY_MAIN,
                boxShadow: `0 8px 28px ${alpha(primaryColor || PRIMARY_MAIN, 0.5)}`,
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: `0 2px 8px ${alpha(primaryColor || PRIMARY_MAIN, 0.3)}`,
              },
              '&:disabled': {
                opacity: 0.55,
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {submitReceiptEntry.isPending ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Confirming...</span>
              </Box>
            ) : (
              'Submit Entry'
            )}
          </AttractButton>

          {/* Secondary action: Subtle, professional */}
          <Button
            onClick={() => setConfirmSubmitOpen(false)}
            variant="text"
            sx={{
              flex: 1,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2.5,
              height: 48,
              color: 'text.secondary',
              transition: 'all 180ms ease-out',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                color: 'text.primary',
              },
            }}
          >
            Go Back
          </Button>
        </DialogActions>
      </Dialog>

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
