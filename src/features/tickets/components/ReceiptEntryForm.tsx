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
  FormControlLabel,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AttractButton from '../../../shared/components/AttractButton';
import AppDatePicker from '../../../shared/components/AppDatePicker';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AccessTime, ReceiptOutlined, EventBusy, GppGood, CheckCircle, CardGiftcardOutlined, StarRounded, ArrowForwardRounded, ConfirmationNumberOutlined, CelebrationRounded, PhotoCameraOutlined, InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import { useUploadReceiptImage } from '../hooks/useUploadReceiptImage';
import { trackFunnel } from '../../../shared/analytics/funnel';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import {
  PRIMARY_MAIN, PRIMARY_LIGHT, PRIMARY_DEEP, GRADIENT_PRIMARY, GRADIENT_FREE_CARD,
  SUCCESS_GREEN, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, BORDER_LIGHT, BG_SUBTLE,
  GRADIENT_CELEBRATION, GRADIENT_DRAW_CARD, SHADOW_ELEVATED,
  ALPHA_WHITE_20, ALPHA_WHITE_30,
  ALPHA_PRIMARY_06, ALPHA_PRIMARY_10, ALPHA_PRIMARY_20,
  ALPHA_AMBER_06, ALPHA_AMBER_25, ALPHA_AMBER_80,
  ERROR_BG_TINT, ERROR_BORDER_TINT, ERROR_DARK,
  SUCCESS_GREEN_TEXT_AA, SUCCESS_GREEN_DEEP,
  BORDER_SUBTLE, BOTTOM_NAV_HEIGHT,
} from '../../../shared/colors';
import { apiErrorMessage, apiErrorCode } from '../../../shared/utils/apiError';
import { staggerContainer, riseIn, popIn, pressable, pressableCard, SPRING_SNAPPY, heroPop } from '../../../shared/motion';
import EntrySuccessDialog from './EntrySuccessDialog';
import ReceiptImageUploadField, { SCAN_INPUT_ID } from './ReceiptImageUploadField';
import { useReadReceipt } from '../hooks/useReadReceipt';
import BusinessSelector from './BusinessSelector';
import SelectedLocationPill from './SelectedLocationPill';
import { getNearbyBusinesses } from '../../nearBy/api/nearBy.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { MAX_ENTRIES_PER_RECEIPT, isAgeRestrictedSector } from '../../../shared/constants/entries';
import { useAppSelector } from '../../../store/hook';
import { selectIsUnder21 } from '../../../store/selectors/authSelectors';
import { useSearchParticipatingLocations } from '../hooks/useAllParticipatingLocations';
import { useSubmitReceiptEntry } from '../hooks/useSubmitReceiptEntry';
import { fetchParticipatingLocationById } from '../api/ticketsApi';
import type { ParticipatingLocation } from '../hooks/useAllParticipatingLocations';
import type { NearbyLocation, NearbyLocationDetail } from '../../nearBy/types/nearBy.types';

// Safari anti-zoom: 16px keeps mobile Safari from auto-zooming the viewport on focus.
// Hoisted at module level so the factory is not re-created per render.
// Device-level "don't show again" for the before-you-submit confirmation dialog.
const SKIP_SUBMIT_CONFIRM_KEY = 'skipSubmitConfirm';

// Floating confetti layout for the maxed-out celebration crest. Static positions
// (no randomness in render); each piece gently bobs with a transform-only loop.
type CrestPiece = {
  top?: number; bottom?: number; left?: string; right?: string;
  w: number; h: number; round?: boolean; opacity: number;
  rotate: number; duration: number; delay: number;
};
const CREST_CONFETTI: CrestPiece[] = [
  { top: 34, left: '8%', w: 10, h: 10, opacity: 1, rotate: 24, duration: 3.4, delay: 0 },
  { top: 58, right: '12%', w: 8, h: 8, opacity: 0.7, rotate: -18, duration: 3, delay: 0.5 },
  { top: 96, left: '13%', w: 7, h: 14, opacity: 0.85, rotate: 40, duration: 3.8, delay: 0.2 },
  { top: 24, right: '22%', w: 9, h: 9, round: true, opacity: 0.6, rotate: -30, duration: 3.2, delay: 0.8 },
  { bottom: 70, right: '9%', w: 11, h: 11, opacity: 0.5, rotate: 12, duration: 3.6, delay: 0.35 },
];

const receiptFieldSx = (accentColor: string) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    '&.Mui-focused fieldset': { borderColor: accentColor },
  },
  // 16px keeps mobile Safari from auto-zooming the viewport on focus.
  '& .MuiOutlinedInput-input': { fontSize: '16px' },
  '& .MuiInputLabel-root.Mui-focused': { color: accentColor },
});

// Photo-first read flow (design Turn 9): the middle block is the only thing that changes.
// Fields mount for every state except awaiting_photo and reading; the Read chip renders
// per field from readFields and clears on user edit.
type ReadState = 'awaiting_photo' | 'reading' | 'read' | 'partial' | 'unread';
type ReadableField = 'id' | 'amount' | 'date';

// The tiny "Read" pill an OCR-filled field wears until the user edits it. Rendered inside
// input adornments (and absolutely overlaid on the date picker, which has no adornment slot).
const ReadChip = () => (
  <Box
    component={motion.span}
    variants={popIn}
    initial="hidden"
    animate="visible"
    sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: 1, py: '3px', borderRadius: 999, bgcolor: alpha(SUCCESS_GREEN_TEXT_AA, 0.09), flexShrink: 0 }}
  >
    <CheckCircle sx={{ fontSize: 11, color: SUCCESS_GREEN_DEEP }} />
    <Typography component="span" sx={{ fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: SUCCESS_GREEN_DEEP, lineHeight: 1 }}>
      Read
    </Typography>
  </Box>
);

// Same look as receiptFieldSx, but targeting the x-date-pickers field classes
// (PickersOutlinedInput) so the date picker matches the other receipt fields.
const receiptDatePickerSx = (accentColor: string) => ({
  '& .MuiPickersOutlinedInput-root': {
    borderRadius: 2.5,
    // 16px keeps mobile Safari from auto-zooming the viewport on focus.
    fontSize: '16px',
    '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': { borderColor: accentColor },
  },
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
    receipt_example_image_url: 'receipt_example_image_url' in n ? n.receipt_example_image_url : null,
    min_transaction_amount: 'min_transaction_amount' in n ? n.min_transaction_amount : null,
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
  // Anti-squatting: shown when the server says this receipt was already typed by someone else.
  // A dialog (not just the inline card) so the explanation can't be scrolled out of view.
  const [contestDialogOpen, setContestDialogOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  // Photo-first read flow: no fields until a photo exists; 'reading' covers upload +
  // extraction; read/partial/unread all keep the photo attached (it feeds the async OCR
  // verification after submit) and differ only in how much arrived pre-filled.
  const [readState, setReadState] = useState<ReadState>('awaiting_photo');
  // Which values came from the read and are untouched - each renders a Read chip that
  // clears on user edit, so a corrected value never wears a stale "we read this" badge.
  const [readFields, setReadFields] = useState<Set<ReadableField>>(new Set());
  const scannedAutofill = useRef(false);
  const receiptIdInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submittedEntryCount, setSubmittedEntryCount] = useState<number>(1);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  // "Don't show again" for the before-you-submit dialog: device-level preference,
  // saved only when the user actually submits with the box checked.
  const [skipConfirmChecked, setSkipConfirmChecked] = useState(false);

  const debouncedTerm = useDebounce(searchTerm, 350);
  // Tracks whether the partial-object branch has already auto-selected a location so it
  // does not re-run on every render. The authoritative-fetch branch intentionally bypasses
  // this guard so it can UPGRADE an already-set partial object once the real data lands.
  const hasAutoSelected = useRef(false);

  // Funnel: once-per-mount flags so field events fire on the FIRST meaningful input only.
  const trackedAmount = useRef(false);
  const trackedReceiptId = useRef(false);
  const trackedImage = useRef(false);

  // ──────────────────────────────────────────────────
  // Hooks
  // ──────────────────────────────────────────────────
  const navigate = useNavigate();
  const riskLevel = useMyRiskLevel();
  const reduceMotion = useReducedMotion();
  const isUnder21 = useAppSelector(selectIsUnder21);
  const { data: searchResults = [], isFetching: isSearching } = useSearchParticipatingLocations(debouncedTerm);
  const receiptImageUpload = useUploadReceiptImage();
  const { readReceipt } = useReadReceipt();

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

  // Quick-picks from the nearby endpoint carry no cap_reached (budget-capped payload), so the
  // stored flag starts false for them. The authoritative detail always carries it - sync once
  // the real data lands for the currently selected location.
  useEffect(() => {
    if (selectedLocationDetail && selectedLocation?.location_id === selectedLocationDetail.location_id) {
      setSelectedLocationCapReached(!!selectedLocationDetail.cap_reached);
    }
  }, [selectedLocationDetail, selectedLocation?.location_id]);

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
      setSelectedLocationCapReached(!!preselectedLocationData.cap_reached);
      onLocationSelect?.(true);
      if (!hasAutoSelected.current) trackFunnel('submit_business_selected', { meta: { preselected: true } });
      hasAutoSelected.current = true;
      return;
    }
    // Show the object passed directly (e.g. from the NearBy drawer) immediately while the fetch loads.
    // Guard with hasAutoSelected so this branch only fires once, not on every parent render.
    if (preselectedLocation && !hasAutoSelected.current) {
      setSelectedLocation(toParticipating(preselectedLocation));
      setSelectedLocationCapReached(!!('cap_reached' in preselectedLocation && preselectedLocation.cap_reached));
      onLocationSelect?.(true);
      trackFunnel('submit_business_selected', { meta: { preselected: true } });
      hasAutoSelected.current = true;
    }
    // No business-id-only fallback: a business id alone can't identify WHICH branch of a
    // multi-location business the user meant.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedLocationData, preselectedLocation]);

  // ──────────────────────────────────────────────────
  // Derived state
  // ──────────────────────────────────────────────────
  // Photo-first made the old risk-based showImageUpload gate moot: a photo is always
  // required now. requiresImage (contest flow) is kept - it just cannot fire anymore.
  // Alcohol/tobacco venues (liquor, pub) are 21+ only (mirrors the server-side entry gate).
  const selectedAgeBlocked = isUnder21 && isAgeRestrictedSector(selectedLocation?.sector);

  // ──────────────────────────────────────────────────
  // Validation
  // ──────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const purchaseDateTooOld = purchaseDate !== '' && purchaseDate < sevenDaysAgo;

  // Photo-first: the receipt photo is unconditionally required (design Turn 9). The old
  // risk-based requiresImage gate and contest dialog remain, but with a photo always
  // present that path simply stops firing.
  const isFormValid =
    selectedLocation &&
    receiptIdentifier.trim().length >= 1 &&
    transactionAmount.trim().length > 0 &&
    parseFloat(transactionAmount) > 0 &&
    purchaseDate !== '' &&
    !purchaseDateTooOld &&
    receiptImageUrl !== null;

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
    trackFunnel('submit_business_selected', { meta: { preselected: false } });
  };

  const handleChangeLocation = () => {
    userChangedLocation.current = true;
    setSelectedLocation(null);
    setSelectedLocationCapReached(false);
    setSearchTerm('');
    setErrorMessage('');
    receiptKeystrokeTimesRef.current = [];
    setReceiptWasPasted(false);
    setReceiptImageUrl(null);
    setReadState('awaiting_photo');
    setReadFields(new Set());
    scannedAutofill.current = false;
    // Clear the receipt values too: a new business + new photo must not inherit the old
    // entry's number/amount/date if the next read comes back partial.
    setReceiptIdentifier('');
    setTransactionAmount('');
    setPurchaseDate(today);
    onLocationSelect?.(false);
  };

  // ── Photo-first read: upload the photo, let the server read it, then mount the fields
  // pre-filled for the user to check. Soft-failure everywhere: an unreadable photo keeps
  // the attachment and the user just types - never a dead end, never a red error.
  const handleReceiptFile = async (file: File) => {
    // One read at a time: the contest dialog's "Attach a photo" can reach the picker even
    // while a read is in flight; stacking two uploads would race the fill.
    if (readState === 'reading') return;
    // Captured before the awaits: on upload failure restore the state that existed when
    // THIS read started, not whatever a later render holds.
    const prevState = readState;
    setReadState('reading');
    setErrorMessage('');
    const url = await receiptImageUpload.upload(file);
    if (!url) {
      // Upload itself failed (hook shows its own error line under the panel).
      setReadState(prevState);
      return;
    }
    setReceiptImageUrl(url);
    const result = await readReceipt(url);
    // Reset ALL fields before applying the new read. Without this, replacing photo A (which
    // filled id+amount) with photo B whose read is PARTIAL (only id) would leave photo A's
    // amount in the field, chip-less, and the user would submit photo B carrying A's amount.
    // Every field a photo owns must come from THAT photo's read or be typed fresh.
    setReceiptIdentifier('');
    setTransactionAmount('');
    setPurchaseDate(today);
    const got = new Set<ReadableField>();
    if (result?.identifier) {
      setReceiptIdentifier(result.identifier);
      got.add('id');
    }
    if (result?.amount != null) {
      setTransactionAmount(result.amount.toFixed(2));
      got.add('amount');
    }
    // Take any read date up to today - INCLUDING one older than the 7-day window. An old
    // date must show as itself so the existing too-old error fires here, before submit;
    // silently defaulting it to today walked honest holders of old receipts into a
    // contradicted-date OCR fail (with a fraud penalty) after submission. Future dates
    // stay discarded (a misread - "too old" messaging would be wrong for them).
    if (result?.date && result.date <= today) {
      setPurchaseDate(result.date);
      // Only badge it as a confirmed read when it is actually usable. An out-of-window date
      // still fills (surfacing the too-old error) but wears no green "Read" chip - a success
      // affirmation next to a rejection reads as a bug; the error line does the explaining.
      if (result.date >= sevenDaysAgo) got.add('date');
    }
    setReadFields(got);
    if (got.size > 0) {
      scannedAutofill.current = true;
      receiptKeystrokeTimesRef.current = [];
      setReceiptWasPasted(false);
    }
    // The date is never a "hole": it falls back to today exactly as the field initialises,
    // so only a missing id or amount demands repair. An unread date simply wears no chip.
    if (got.has('id') && got.has('amount')) {
      setReadState('read');
    } else if (got.size > 0) {
      setReadState('partial');
      // Land the caret in the first hole so the repair is one tap shorter.
      setTimeout(() => {
        if (!got.has('id')) receiptIdInputRef.current?.focus();
        else if (!got.has('amount')) amountInputRef.current?.focus();
      }, 0);
    } else {
      setReadState('unread');
      setTimeout(() => receiptIdInputRef.current?.focus(), 0);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTransactionAmount(value);
      if (!trackedAmount.current && parseFloat(value) > 0) {
        trackedAmount.current = true;
        trackFunnel('submit_amount_entered');
      }
    }
  };

  // Funnel: receipt id + image milestones, first time each becomes meaningful.
  useEffect(() => {
    if (!trackedReceiptId.current && receiptIdentifier.trim().length >= 1) {
      trackedReceiptId.current = true;
      trackFunnel('submit_receipt_id_entered');
    }
  }, [receiptIdentifier]);
  useEffect(() => {
    if (!trackedImage.current && receiptImageUrl !== null) {
      trackedImage.current = true;
      trackFunnel('submit_image_attached');
    }
  }, [receiptImageUrl]);

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
    // A scan-filled value the user never retyped counts as 'scanned': keystroke timing only
    // applies to typed input (times are cleared when the scan fills the fields, so
    // typingDurationMs is naturally undefined here).
    const receiptInputMethod = receiptWasPasted
      ? 'pasted'
      : scannedAutofill.current && receiptKeystrokeTimesRef.current.length === 0 ? 'scanned' : 'typed';

    trackFunnel('submit_attempted', { flushNow: true });
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
        trackFunnel('submission_confirmed_shown');
        setReceiptIdentifier('');
        setTransactionAmount('');
        setPurchaseDate(today);
        setErrorMessage('');
        receiptKeystrokeTimesRef.current = [];
        setReceiptWasPasted(false);
        setReceiptImageUrl(null);
        setReadState('awaiting_photo');
        setReadFields(new Set());
        scannedAutofill.current = false;
        onSuccess?.(data.ticketId);
      },
      onError: (err) => {
        const message = apiErrorMessage(err, 'Submission failed. Please try again.');
        // Dedup ladder: this receipt NUMBER is already claimed (a squatter's typed entry, the
        // user's own entry from another day at a daily-reset register, or another day's claim).
        // Reveal the image upload and ask for a photo so the scan can verify the printed date
        // and document. Code-based so it does not depend on the exact server message text.
        if (apiErrorCode(err) === 'RECEIPT_CONTEST_IMAGE_REQUIRED') {
          // Explain it in a dialog so it can't be missed; keep a short inline note as a fallback.
          setContestDialogOpen(true);
          setErrorMessage('This receipt number was already entered. Attach a photo of your receipt below and submit again so we can verify it.');
        } else if (message === 'A receipt image is required to submit an entry.') {
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

  // readState guard: during a re-read the previous values and photo URL are still in state,
  // so without it the form could submit the OLD photo while the new one is mid-upload.
  const canSubmit = isFormValid && readState !== 'reading' && !submitReceiptEntry.isPending && !riskLevel.isThrottled && !riskLevel.isDailyLimitReached;

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

  // Shared error card so mobile (inline, above the mobile submit) and desktop (right rail,
  // below the submit button) render the exact same thing.
  const renderErrorCard = () => (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 1.5,
      p: 2, borderRadius: 2.5,
      bgcolor: ERROR_BG_TINT, border: `1px solid ${ERROR_BORDER_TINT}`,
    }}>
      <WarningAmberRounded sx={{ fontSize: 20, color: ERROR_DARK, flexShrink: 0, mt: '1px' }} />
      <Typography variant="body2" sx={{ color: ERROR_DARK, fontWeight: 500, lineHeight: 1.5 }}>
        {errorMessage}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Draw cap reached - celebration card ──────── */}
      {riskLevel.isDrawCapped && (
        <motion.div initial='hidden' animate='visible' variants={staggerContainer}>
          <Box sx={{ borderRadius: '26px', overflow: 'hidden', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_ELEVATED }}>

            {/* Blue crest: glow orbs + floating confetti + trophy medallion */}
            <Box sx={{ position: 'relative', overflow: 'hidden', px: { xs: 3, sm: 5 }, pt: { xs: 4.5, sm: 5.5 }, pb: 8, background: GRADIENT_CELEBRATION }}>
              <Box sx={{ position: 'absolute', top: -90, right: -70, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_20, filter: 'blur(50px)', pointerEvents: 'none' }} />
              <Box sx={{ position: 'absolute', bottom: -120, left: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: alpha(PRIMARY_LIGHT, 0.4), filter: 'blur(60px)', pointerEvents: 'none' }} />

              {CREST_CONFETTI.map((c, i) => (
                <Box
                  key={i}
                  component={motion.span}
                  initial={{ rotate: c.rotate, y: 0 }}
                  animate={reduceMotion ? { rotate: c.rotate } : { rotate: c.rotate, y: [0, -6, 0] }}
                  transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
                  sx={{
                    position: 'absolute', top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                    width: c.w, height: c.h, borderRadius: c.round ? '50%' : '2px',
                    bgcolor: 'common.white', opacity: c.opacity, pointerEvents: 'none', display: 'block',
                  }}
                />
              ))}

              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <motion.div variants={heroPop}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.9, bgcolor: ALPHA_WHITE_20, border: '1px solid', borderColor: ALPHA_WHITE_30, borderRadius: 999, px: 1.75, py: 0.6 }}>
                    <StarRounded sx={{ fontSize: 16, color: 'common.white' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.03em', color: 'common.white' }}>
                      ALL {MAX_ENTRIES_PER_DRAW} ENTRIES CLAIMED
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </Box>

            {/* Body card overlapping the crest */}
            <Box sx={{ px: { xs: 2, sm: 4 }, pb: { xs: 3, sm: 4 }, mt: -3.75, position: 'relative' }}>
              <Box sx={{ bgcolor: 'background.paper', borderRadius: '22px', p: { xs: 2.5, sm: 3.5 } }}>
                <motion.div variants={popIn}>
                  <Typography sx={{ textAlign: 'center', fontSize: { xs: '1.5rem', sm: '1.8rem' }, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: TEXT_HEADING }}>
                    Well done!
                    <CelebrationRounded sx={{ fontSize: '1.15em', color: PRIMARY_MAIN, verticalAlign: 'text-bottom', ml: 0.75 }} />
                  </Typography>
                  <Typography sx={{ textAlign: 'center', fontSize: '0.94rem', lineHeight: 1.65, color: TEXT_SECONDARY, mt: 1.5, mx: 'auto', maxWidth: 400 }}>
                    All <Box component='strong' sx={{ color: TEXT_HEADING }}>{MAX_ENTRIES_PER_DRAW} entries</Box> are claimed, that's the maximum for this campaign. Sit back, relax, and let the draw do its thing. Good luck!
                  </Typography>
                </motion.div>

                {/* Filled entry meter with shimmer */}
                <motion.div variants={popIn}>
                  <Box sx={{ mt: 3, bgcolor: ALPHA_PRIMARY_06, border: '1px solid', borderColor: ALPHA_PRIMARY_20, borderRadius: '16px', px: 2.25, py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.25 }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: PRIMARY_MAIN }}>
                        Your entries
                      </Typography>
                      <Typography sx={{ fontSize: '0.94rem', fontWeight: 800, color: PRIMARY_DEEP }}>
                        {MAX_ENTRIES_PER_DRAW} <Box component='span' sx={{ color: alpha(PRIMARY_MAIN, 0.45) }}>/ {MAX_ENTRIES_PER_DRAW}</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'relative', height: 11, borderRadius: '7px', bgcolor: ALPHA_PRIMARY_10, overflow: 'hidden' }}>
                      <Box sx={{ width: '100%', height: '100%', borderRadius: '7px', background: `linear-gradient(90deg, ${PRIMARY_LIGHT}, ${PRIMARY_MAIN})` }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.4 }}>
                      <CheckCircle sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
                      <Typography sx={{ fontSize: '0.79rem', fontWeight: 700, color: PRIMARY_MAIN }}>
                        Entry cap reached - you're all set
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>

                {/* CTA to My Entries */}
                <motion.div variants={popIn} {...pressable}>
                  <AttractButton
                    fullWidth
                    onClick={() => navigate('/tickets')}
                    startIcon={<ConfirmationNumberOutlined />}
                    sx={{
                      mt: 2.75, borderRadius: '15px', py: 1.8, fontSize: '0.95rem', fontWeight: 800, textTransform: 'none',
                      color: 'common.white', background: GRADIENT_DRAW_CARD,
                      boxShadow: `0 12px 24px -8px ${alpha(PRIMARY_MAIN, 0.55)}`,
                      '&:hover': { background: GRADIENT_DRAW_CARD, filter: 'brightness(1.08)' },
                    }}
                  >
                    View my entries
                  </AttractButton>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </motion.div>
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
                  searchResults={isUnder21 ? searchResults.filter((l) => !isAgeRestrictedSector(l.sector)) : searchResults}
                  nearbyLocations={isUnder21 ? nearbyLocations.filter((l) => !isAgeRestrictedSector(l.sector)) : nearbyLocations}
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

      {/* ── Age-restricted notice — replaces the entire form. Under-21 users cannot reach
          such a location via the pick lists (filtered) or map popup (blocked button); this
          covers deep links and stale router state. The server enforces the same rule. ── */}
      {selectedLocation && selectedAgeBlocked && !selectedLocationCapReached && !successDialogOpen && (
        <>
          <SelectedLocationPill primaryColor={primaryColor} location={selectedLocation} onChangeLocation={handleChangeLocation} />
          <Box sx={{
            p: 3, borderRadius: 2.5, textAlign: 'center',
            bgcolor: ALPHA_AMBER_06, border: `1px solid ${ALPHA_AMBER_25}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <EventBusy sx={{ fontSize: 32, color: ALPHA_AMBER_80 }} />
            <Typography variant='subtitle2' fontWeight={800} color='text.primary'>
              21+ only
            </Typography>
            <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
              Entries at this business are limited to participants aged 21 and older. Please pick another participating location.
            </Typography>
          </Box>
        </>
      )}

      {/* ── Cap reached notice — replaces the entire form ── */}
      {selectedLocation && selectedLocationCapReached && !successDialogOpen && (
        <>
          <SelectedLocationPill primaryColor={primaryColor} location={selectedLocation} onChangeLocation={handleChangeLocation} />
          <Box sx={{
            p: 3, borderRadius: 2.5, textAlign: 'center',
            bgcolor: ALPHA_AMBER_06, border: `1px solid ${ALPHA_AMBER_25}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          }}>
            <EventBusy sx={{ fontSize: 32, color: ALPHA_AMBER_80 }} />
            <Typography variant='subtitle2' fontWeight={800} color='text.primary'>
              This location is full
            </Typography>
            <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
              This location has reached its entry limit for the current campaign. This is not your fault - try visiting another participating location.
            </Typography>
          </Box>
        </>
      )}

      {/* ── Contest ("already entered, prove it's yours") dialog ──────────────
          Shown when the server returns RECEIPT_CONTEST_IMAGE_REQUIRED. A dialog (not just the
          inline card) so the explanation is never scrolled out of view. */}
      <Dialog
        open={contestDialogOpen}
        onClose={() => setContestDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${primaryColor || PRIMARY_MAIN}14`,
          }}>
            <PhotoCameraOutlined sx={{ fontSize: 28, color: primaryColor || PRIMARY_MAIN }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            Just one quick step
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
           This receipt number was already entered. If your receipt is from a different purchase, upload a clear photo of it so we can verify your entry.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <AttractButton
            fullWidth
            variant="contained"
            onClick={() => {
              setContestDialogOpen(false);
              // Open the scan tile's picker directly - "Attach a photo" should attach a photo,
              // not drop the user back on the form to find the tile themselves.
              document.getElementById(SCAN_INPUT_ID)?.click();
            }}
            startIcon={<PhotoCameraOutlined />}
            sx={{
              height: 48, borderRadius: 2.5, fontWeight: 800, textTransform: 'none',
              bgcolor: primaryColor || PRIMARY_MAIN,
              '&:hover': { bgcolor: primaryColor || PRIMARY_MAIN, filter: 'brightness(0.9)' },
            }}
          >
            Attach a photo
          </AttractButton>
        </DialogActions>
      </Dialog>

      {/* ── Step 2: Receipt details ─────────────────── */}
      <Collapse in={Boolean(selectedLocation) && !successDialogOpen && !selectedLocationCapReached && !selectedAgeBlocked}>
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

          {/* Photo first: this block IS the step until a photo exists. It collapses into a
              progress row while reading, then a green attached row; the fields only mount
              once the read settles. */}
          <ReceiptImageUploadField
            state={readState === 'awaiting_photo' ? 'prompt' : readState === 'reading' ? 'reading' : 'row'}
            receiptImageUrl={receiptImageUrl}
            uploadError={receiptImageUpload.error}
            onFile={handleReceiptFile}
          />

          {/* Reading: skeletons where the three fields and the submit are about to arrive. */}
          {readState === 'reading' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} aria-hidden>
              <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5, bgcolor: BORDER_SUBTLE }} />
              <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5, bgcolor: BORDER_SUBTLE }} />
              <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2.5, bgcolor: BG_SUBTLE }} />
              <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2.5, bgcolor: BG_SUBTLE }} />
            </Box>
          )}

          {(readState === 'read' || readState === 'partial' || readState === 'unread') && (
          <Box component={motion.div} variants={staggerContainer} initial="hidden" animate="visible" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* What the read produced, in one line - never red: a soft read is ours to fix. */}
          <Box component={motion.div} variants={riseIn}>
            {readState !== 'unread' ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', pl: '2px' }}>
                  <CheckCircle sx={{ fontSize: 16, color: SUCCESS_GREEN_TEXT_AA }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>Check what we read</Typography>
                </Box>
                <Typography sx={{ mt: '3px', pl: '2px', fontSize: 12, lineHeight: 1.5, color: TEXT_TERTIARY }}>
                  {readState === 'read' ? (
                    <>
                      <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Tap a field to correct it.</Box>
                      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Click a field to correct it.</Box>
                    </>
                  ) : !readFields.has('amount') && readFields.has('id') ? (
                    'We could not make out the total. Add it below.'
                  ) : !readFields.has('id') && readFields.has('amount') ? (
                    'We could not make out the receipt number. Add it below.'
                  ) : (
                    'We could not make out everything. Fill in the rest below.'
                  )}
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', pl: '2px' }}>
                  <InfoOutlined sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>Could not read this photo</Typography>
                </Box>
                <Typography sx={{ mt: '3px', pl: '2px', fontSize: 12, lineHeight: 1.5, color: TEXT_TERTIARY }}>
                  Just type the details below. Your photo stays attached.
                </Typography>
              </>
            )}
          </Box>

          {/* Receipt ID */}
          <TextField
            fullWidth
            label="Receipt / Transaction ID"
            placeholder="e.g. RCP-12345"
            value={receiptIdentifier}
            inputRef={receiptIdInputRef}
            onChange={(e) => {
              const val = e.target.value;
              setReceiptIdentifier(val);
              // Editing removes the Read chip: the value is the user's now, not the read's.
              if (readFields.has('id')) setReadFields((f) => { const n = new Set(f); n.delete('id'); return n; });
              // A different receipt number is a different situation: clear the contest error.
              if (errorMessage) setErrorMessage('');
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
            helperText={'Find this on your receipt - may say "Receipt #", "Order #" or "Check #"'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptOutlined sx={{ fontSize: 20, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: readFields.has('id') ? (
                <InputAdornment position="end">
                  <ReadChip />
                </InputAdornment>
              ) : undefined,
            }}
            sx={receiptFieldSx(primaryColor || PRIMARY_MAIN)}
          />

          {/* Amount + date pair up on one desktop row (design 9f) - there is width for it. */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, '& > *': { flex: 1, minWidth: 0 } }}>

          {/* Amount */}
          <TextField
            fullWidth
            label="Amount spent before tax and tip"
            placeholder="0.00"
            value={transactionAmount}
            inputRef={amountInputRef}
            onChange={(e) => {
              if (readFields.has('amount')) setReadFields((f) => { const n = new Set(f); n.delete('amount'); return n; });
              handleAmountChange(e);
            }}
            helperText={readState === 'partial' && !readFields.has('amount') && transactionAmount === '' ? 'Type the total from your receipt.' : undefined}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '1.05rem', lineHeight: 1 }}>$</Typography>
                </InputAdornment>
              ),
              endAdornment: readFields.has('amount') ? (
                <InputAdornment position="end">
                  <ReadChip />
                </InputAdornment>
              ) : undefined,
            }}
            sx={receiptFieldSx(primaryColor || PRIMARY_MAIN)}
          />

          {/* Purchase Date - the date picker has no adornment slot, so its Read chip is
              overlaid inside the field, left of the calendar icon. Changing the date
              removes the chip like any other edit. */}
          <Box sx={{ position: 'relative' }}>
            <AppDatePicker
              label="Date of purchase"
              value={purchaseDate}
              onChange={(v) => {
                if (readFields.has('date') && v !== purchaseDate) {
                  setReadFields((f) => { const n = new Set(f); n.delete('date'); return n; });
                }
                setPurchaseDate(v);
              }}
              minDate={sevenDaysAgo}
              maxDate={today}
              error={purchaseDateTooOld}
              helperText={purchaseDateTooOld ? 'Receipt is older than 7 days and cannot be accepted.' : ''}
              sx={receiptDatePickerSx(primaryColor || PRIMARY_MAIN)}
            />
            {readFields.has('date') && (
              <Box sx={{ position: 'absolute', top: 28, right: 52, transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <ReadChip />
              </Box>
            )}
          </Box>
          </Box>

          {/* This receipt earns N entries - MOBILE banner (the desktop rail carries its own
              card). Springs in when the amount first crosses the minimum. */}
          <AnimatePresence initial={false}>
            {previewCount > 0 && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                transition={SPRING_SNAPPY}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                <Box sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25,
                  p: '14px 16px', borderRadius: 2.5,
                  background: `linear-gradient(135deg, ${alpha(PRIMARY_LIGHT, 0.1)} 0%, ${alpha(PRIMARY_MAIN, 0.06)} 100%)`,
                  border: `1px solid ${alpha(PRIMARY_LIGHT, 0.33)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.125, minWidth: 0 }}>
                    <ConfirmationNumberOutlined sx={{ fontSize: 20, color: PRIMARY_MAIN, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: PRIMARY_DEEP }}>This receipt earns</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexShrink: 0 }}>
                    {/* Keyed by count so every change hops - same trick as the My Entries number. */}
                    <motion.span
                      key={previewCount}
                      style={{ display: 'inline-block' }}
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={SPRING_SNAPPY}
                    >
                      <Typography component="span" sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1, color: PRIMARY_MAIN }}>{previewCount}</Typography>
                    </motion.span>
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: PRIMARY_MAIN }}>
                      {previewCount === 1 ? 'entry' : 'entries'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </AnimatePresence>

          {/* Error — MOBILE only. On desktop it lives in the right rail below the submit
              button (see renderErrorCard there) so it is never pushed off-screen below the
              long field column. */}
          {errorMessage && (
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {renderErrorCard()}
            </Box>
          )}

              {/* Mobile submit: sticks above the fixed tab bar with NO bar chrome - the
                  button floats over the content on its own (its drop shadow separates it).
                  Stays in the scroll flow (sticky, not fixed): an open keyboard pushes it
                  with the content instead of pinning it over the field being typed in.
                  (Desktop submit lives in the summary rail.) */}
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  position: 'sticky', bottom: `${BOTTOM_NAV_HEIGHT + 10}px`, zIndex: 4,
                  mt: 1,
                }}
              >
                {renderSubmit()}
              </Box>
          </Box>
          )}
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
            {/* Error — DESKTOP: directly under the submit button in the right rail, where the
                user is looking after they click. Keeps it in view instead of buried below the
                fields. Mobile renders it inline above the mobile submit. */}
            {errorMessage && (
              <Box sx={{ mt: 2 }}>
                {renderErrorCard()}
              </Box>
            )}
            {/* Privacy note (design 9f rail). */}
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.75, borderRadius: 2.5, bgcolor: 'background.paper', border: `1px solid ${BORDER_LIGHT}` }}>
              <Box component="svg" viewBox="0 0 24 24" sx={{ width: 15, height: 15, flexShrink: 0, mt: '1px', fill: SUCCESS_GREEN_TEXT_AA }}>
                <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9z" />
              </Box>
              <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: TEXT_TERTIARY }}>
                Used to verify this entry only.
              </Typography>
            </Box>
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
                color: 'common.white',
              }}
            />
          </Box>

          {/* Heading in white on gradient */}
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'common.white',
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
              color: 'common.white',
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
