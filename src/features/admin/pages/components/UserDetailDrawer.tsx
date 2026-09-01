import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import { motion } from 'framer-motion';
import { useUserDetail, useAdminImageDecision, type AdminJourneyEvent } from '../../hooks/useAdmin';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  BG_ROW_SUBTLE,
  BORDER_LIGHT,
  BORDER_SUBTLE,
  TEXT_HEADING,
  TEXT_TERTIARY,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG,
  STATUS_PENDING_TEXT,
  METRIC_BAD_TINT,
  METRIC_BAD,
  METRIC_GOOD_TINT,
  METRIC_GOOD,
  METRIC_WARN_TINT,
  METRIC_WARN,
  PRIMARY_MAIN,
  GRADIENT_PRIMARY,
} from '../../../../shared/colors';
import { staggerContainer, popIn } from '../../../../shared/motion';
import { AdminCard, SectionHeader } from './adminUi';

interface Props {
  userId: number | null;
  onClose: () => void;
}

// 'code' stays only to label legacy tickets from the removed code entry mode.
const SOURCE_LABELS: Record<string, string> = {
  code: 'Code',
  receipt: 'Receipt',
  free: 'Weekly',
  promo: 'Promo',
  referral: 'Referral',
};

const QUARANTINE_LABELS: Record<string, string> = {
  high_risk_user: 'High risk user',
  ocr_pending: 'Image pending review',
  ocr_validation_failed: 'Image rejected',
  ocr_error_pending_review: 'OCR error - pending review',
  shared_receipt_suspected: 'Shared receipt',
  superseded_by_verified_image: 'Duplicate receipt',
  superseded_by_admin_decision: 'Superseded (admin)',
  contest_pending: 'Under review',
  contest_not_won: 'Not verified',
  duplicate_document: 'Duplicate document',
  date_unreadable_review: 'Date unreadable - held for review',
};

const RISK_FLAG_LABELS: Record<string, string> = {
  duplicate_identifier_cross_user: 'Cross-user duplicate',
  high_submission_velocity: 'High velocity (≥4/day)',
  elevated_submission_velocity: 'Elevated velocity (≥3/day)',
  sustained_weekly_velocity: 'High weekly volume',
  sustained_monthly_volume: 'High monthly volume',
  rapid_submission: 'Rapid re-submit (<30s)',
  sequential_guessing: 'Sequential guessing',
  threshold_probing: 'Threshold probing',
  amount_outlier: 'Amount outlier (>3×avg)',
  suspiciously_fast_input: 'Suspiciously fast input',
  superseded_duplicate_receipt: 'Duplicate receipt (owner verified theirs)',
  duplicate_document: 'Reused receipt (different number, same image)',
  same_business_receipt_velocity: 'Many verified receipts at one business (24h)',
};

type ManagedLocation = {
  location_id: number;
  location_name: string;
  location_active: boolean;
  business_id: number;
  business_name: string;
};

// How the user arrived (user_acquisition, written once at signup). null for accounts
// that predate acquisition tracking.
type Acquisition = {
  source: 'referral' | 'promo_code' | 'location_flyer' | 'direct';
  promo_code: string | null;
  referral_rewarded_at: string | null;
  location_id: number | null;
  location_name: string | null;
  location_business_id: number | null;
  location_business_name: string | null;
  referrer_id: number | null;
  referrer_name: string | null;
  referrer_email: string | null;
};

const ACQUISITION_LABELS: Record<Acquisition['source'], string> = {
  location_flyer: 'QR flyer scan',
  referral: 'Friend referral',
  promo_code: 'Promo code',
  direct: 'Direct signup',
};

// ── Journey timeline (funnel_event stream, oldest first) ─────────────────────

const JOURNEY_EVENT_LABELS: Record<string, string> = {
  scan_landing_viewed: 'Viewed the QR landing page',
  join_landing_viewed: 'Viewed the invite landing page',
  registration_page_viewed: 'Viewed the sign-up page',
  registration_started: 'Started signing up',
  registration_email_entered: 'Entered their email',
  terms_accepted: 'Accepted the terms',
  registration_submitted: 'Submitted the sign-up form',
  registration_failed: 'Sign-up failed',
  email_verification_pending: 'Sent to email verification',
  account_created: 'Account created',
  first_login: 'First sign-in',
  returning_login: 'Signed in again',
  profile_setup_viewed: 'Viewed profile setup',
  profile_setup_completed: 'Completed profile setup',
  profile_setup_failed: 'Profile setup failed',
  submit_page_viewed: 'Viewed the entry page',
  submit_business_selected: 'Picked a business',
  submit_amount_entered: 'Entered a receipt amount',
  submit_receipt_id_entered: 'Entered a receipt number',
  receipt_scan_used: 'Scanned a receipt photo',
  submit_image_attached: 'Attached a receipt photo',
  submit_image_upload_failed: 'Receipt photo upload failed',
  submit_attempted: 'Submitted an entry',
  submission_confirmed_shown: 'Saw the entry confirmation',
  tour_viewed: 'Started the intro tour',
  tour_completed: 'Finished the intro tour',
  tour_skipped: 'Skipped the intro tour',
  spotlight_weekly_shown: 'Saw the weekly entry spotlight',
  spotlight_weekly_clicked: 'Tapped the weekly entry spotlight',
  submission_accepted: 'Entry accepted',
  submission_rejected: 'Entry rejected',
  submission_ocr_cleared: 'Receipt image verified',
  submission_ocr_rejected: 'Receipt image rejected',
  otp_requested: 'Requested a phone code',
  otp_send_failed: 'Phone code failed to send',
  otp_delivered: 'Phone code delivered',
  otp_undelivered: 'Phone code not delivered',
  otp_verify_attempted: 'Entered a phone code',
  otp_verified: 'Phone verified',
  otp_verify_failed: 'Phone code incorrect',
};

const JOURNEY_DEVICE_LABELS: Record<string, string> = {
  ios_pwa: 'iOS app',
  ios_safari: 'iOS Safari',
  android_pwa: 'Android app',
  android_chrome: 'Android Chrome',
  desktop: 'Desktop',
  other: 'Other device',
};

const JOURNEY_GOOD = new Set([
  'account_created', 'first_login', 'profile_setup_completed', 'otp_verified',
  'submission_accepted', 'submission_ocr_cleared',
]);
const isJourneyBad = (t: string) =>
  t.endsWith('_failed') || t.endsWith('_rejected') || t === 'otp_undelivered';

const formatGap = (ms: number): string => {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min later`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h later`;
  return `${Math.round(hours / 24)} days later`;
};

const JourneyTimeline: React.FC<{ events: AdminJourneyEvent[] }> = ({ events }) => {
  const rows: React.ReactNode[] = [];
  let prevDate = '';
  let prevDevice: string | null = null;
  let prevTs = 0;

  events.forEach((ev, i) => {
    const at = new Date(ev.occurred_at);
    const dayKey = at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const ts = at.getTime();

    if (dayKey !== prevDate) {
      rows.push(
        <Typography key={`day-${i}`} variant='caption' display='block' sx={{ color: TEXT_HEADING, fontWeight: 800, mt: i === 0 ? 0 : 1.5, mb: 0.5 }}>
          {dayKey}
        </Typography>,
      );
    } else if (prevTs && ts - prevTs > 30 * 60000) {
      // A same-day pause over 30 minutes reads as a separate visit; mark the gap.
      rows.push(
        <Typography key={`gap-${i}`} variant='caption' display='block' sx={{ color: TEXT_TERTIARY, fontStyle: 'italic', py: 0.5, pl: 8.5 }}>
          {formatGap(ts - prevTs)}
        </Typography>,
      );
    }
    prevDate = dayKey;
    prevTs = ts;

    const deviceChanged = ev.device_class != null && ev.device_class !== prevDevice;
    if (ev.device_class != null) prevDevice = ev.device_class;

    const dotColor = isJourneyBad(ev.event_type) ? METRIC_BAD : JOURNEY_GOOD.has(ev.event_type) ? METRIC_GOOD : PRIMARY_MAIN;
    const meta = ev.meta ?? {};
    const entryCount = typeof meta.entry_count === 'number' ? meta.entry_count : null;

    rows.push(
      <Stack key={`ev-${i}`} direction='row' spacing={1} alignItems='flex-start' sx={{ position: 'relative', pb: 0.75 }}>
        <Typography variant='caption' sx={{ color: TEXT_TERTIARY, minWidth: 56, pt: '1px', fontVariantNumeric: 'tabular-nums' }}>
          {at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch', pt: '5px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }} />
          {i < events.length - 1 && <Box sx={{ width: '2px', flex: 1, bgcolor: BORDER_SUBTLE, mt: 0.5 }} />}
        </Box>
        <Stack direction='row' spacing={0.75} alignItems='center' flexWrap='wrap' useFlexGap sx={{ minWidth: 0 }}>
          <Typography variant='body2' fontWeight={600} sx={{ color: isJourneyBad(ev.event_type) ? METRIC_BAD : TEXT_HEADING }}>
            {JOURNEY_EVENT_LABELS[ev.event_type] ?? ev.event_type}
            {entryCount != null && entryCount > 1 && ` (${entryCount} entries)`}
          </Typography>
          {ev.reason_code && (
            <Chip
              label={ev.reason_code.replace(/_/g, ' ')}
              size='small'
              sx={{ bgcolor: METRIC_BAD_TINT, color: METRIC_BAD, fontWeight: 700, borderRadius: '6px', fontSize: 10, height: 18 }}
            />
          )}
          {meta.preselected === true && (
            <Chip
              label='preselected from flyer'
              size='small'
              sx={{ bgcolor: BG_ROW_SUBTLE, color: TEXT_TERTIARY, fontWeight: 700, borderRadius: '6px', fontSize: 10, height: 18 }}
            />
          )}
          {deviceChanged && ev.device_class && (
            <Chip
              label={JOURNEY_DEVICE_LABELS[ev.device_class] ?? ev.device_class}
              size='small'
              sx={{ bgcolor: STATUS_PENDING_BG, color: STATUS_PENDING_TEXT, fontWeight: 700, borderRadius: '6px', fontSize: 10, height: 18 }}
            />
          )}
        </Stack>
      </Stack>,
    );
  });

  return <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>{rows}</Box>;
};

const UserDetailDrawer: React.FC<Props> = ({ userId, onClose }) => {
  const { data, isLoading } = useUserDetail(userId);
  const imageDecision = useAdminImageDecision();
  const [pendingTicket, setPendingTicket] = React.useState<number | null>(null);
  const user = data?.user;
  const entries = data?.entries ?? [];
  const journey = data?.journey ?? [];
  const acquisition = (user?.acquisition ?? null) as Acquisition | null;
  // Branch managers own no business row - their tie to a business is the location(s)
  // they manage, surfaced by getUserDetailService as a JSON array.
  const managedLocations: ManagedLocation[] = Array.isArray(user?.managed_locations)
    ? (user.managed_locations as ManagedLocation[])
    : [];

  const riskLabel =
    (user?.risk_score ?? 0) >= 20 ? 'HIGH' : (user?.risk_score ?? 0) >= 10 ? 'MEDIUM' : 'LOW';
  const RiskIcon =
    (user?.risk_score ?? 0) >= 20 ? GppBadIcon : (user?.risk_score ?? 0) >= 10 ? WarningIcon : VerifiedUserIcon;

  return (
    <Drawer
      anchor='right'
      open={userId !== null}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 600, md: 900, lg: 1000 },
          p: 0,
          borderRadius: { md: '20px 0 0 20px' },
        }
      }}
    >
      {/* Header with gradient band */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          px: 3,
          py: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '60%',
            height: '120%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            User Profile
          </Typography>
          <IconButton onClick={onClose} size='small' sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, p: 3 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant='circular' width={56} height={56} />
            <Skeleton variant='text' width='60%' height={32} />
            <Skeleton variant='text' width='40%' />
            <Skeleton variant='rounded' height={80} />
            <Skeleton variant='rounded' height={200} />
          </Stack>
        ) : user ? (
          <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
            <Stack spacing={3}>
            {/* Identity */}
            <motion.div variants={popIn}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: GRADIENT_PRIMARY,
                    color: 'white',
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {(user.full_name ?? user.email ?? '?')[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h6' fontWeight={800} lineHeight={1.2} sx={{ color: TEXT_HEADING, letterSpacing: '-0.02em' }}>
                    {user.full_name ?? '—'}
                  </Typography>
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                    {user.email}
                  </Typography>
                </Box>
              </Stack>
            </motion.div>

            {/* Status chips */}
            <motion.div variants={popIn}>
              <Stack direction='row' spacing={0.75} flexWrap='wrap'>
                <Chip
                  label={user.role}
                  size='small'
                  sx={{
                    bgcolor: user.role === 'Business' ? PRIMARY_MAIN : 'default',
                    color: user.role === 'Business' ? 'white' : 'default',
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={user.is_active ? 'Active' : 'Inactive'}
                  size='small'
                  sx={{
                    bgcolor: user.is_active ? STATUS_ACTIVATED_BG : 'transparent',
                    color: user.is_active ? STATUS_ACTIVATED_TEXT : TEXT_TERTIARY,
                    border: user.is_active ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={user.is_email_verified ? 'Email Verified' : 'Unverified'}
                  size='small'
                  sx={{
                    bgcolor: user.is_email_verified ? STATUS_ACTIVATED_BG : STATUS_PENDING_BG,
                    color: user.is_email_verified ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  icon={<RiskIcon sx={{ fontSize: 14 }} />}
                  label={`${riskLabel} · ${user.risk_score}`}
                  size='small'
                  sx={{
                    bgcolor: user.risk_score >= 20 ? METRIC_BAD_TINT : user.risk_score >= 10 ? METRIC_WARN_TINT : METRIC_GOOD_TINT,
                    color: user.risk_score >= 20 ? METRIC_BAD : user.risk_score >= 10 ? METRIC_WARN : METRIC_GOOD,
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: 'none',
                  }}
                />
              </Stack>
            </motion.div>

            {/* Journey: every recorded step through the app, oldest first, including the
                anonymous pre-signup session stitched at account creation */}
            <motion.div variants={popIn}>
              <AdminCard sx={{ p: 2 }}>
                <Stack direction='row' spacing={1} alignItems='center' mb={1.5}>
                  <RouteOutlinedIcon sx={{ fontSize: 18, color: PRIMARY_MAIN }} />
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Journey
                  </Typography>
                  {journey.length > 0 && (
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                      {journey.length} steps
                    </Typography>
                  )}
                </Stack>
                {journey.length > 0 ? (
                  <JourneyTimeline events={journey} />
                ) : (
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                    No journey events recorded - this account predates event tracking.
                  </Typography>
                )}
              </AdminCard>
            </motion.div>

            {/* Stats */}
            <motion.div variants={popIn}>
              <AdminCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '15px' }}>
                  {[
                    { label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-US') },
                    { label: 'Total Entries', value: entries.length },
                    { label: 'Business', value: user.business_name ?? '—' },
                    { label: 'Last Flagged', value: user.risk_last_flagged_at ? new Date(user.risk_last_flagged_at).toLocaleDateString('en-US') : 'Never' },
                  ].map(({ label, value }, idx) => (
                    <Box
                      key={label}
                      sx={{
                        p: 2,
                        borderBottom: idx >= 2 ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                        borderRight: idx % 2 === 0 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                        bgcolor: idx % 2 === 0 ? BG_ROW_SUBTLE : 'transparent',
                      }}
                    >
                      <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 700 }} display='block'>
                        {label}
                      </Typography>
                      <Typography variant='body2' fontWeight={600} sx={{ color: TEXT_HEADING, mt: 0.5 }}>
                        {String(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </AdminCard>
            </motion.div>

            {/* Joined via: the exact acquisition channel recorded at signup */}
            <motion.div variants={popIn}>
              <AdminCard sx={{ p: 2 }}>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }} display='block' mb={1.5}>
                  Joined via
                </Typography>
                {acquisition ? (
                  <Stack spacing={1}>
                    <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                      <Chip
                        label={ACQUISITION_LABELS[acquisition.source] ?? acquisition.source}
                        size='small'
                        sx={{ bgcolor: PRIMARY_MAIN, color: 'white', fontWeight: 700, borderRadius: '8px' }}
                      />
                      {acquisition.source === 'location_flyer' && (
                        acquisition.location_name ? (
                          <Typography variant='body2' sx={{ color: TEXT_HEADING }}>
                            Scanned the flyer at{' '}
                            <Box component='span' sx={{ fontWeight: 700 }}>{acquisition.location_name}</Box>
                            {acquisition.location_business_name && (
                              <>
                                {' '}·{' '}
                                <Box component='span' sx={{ fontWeight: 600, color: PRIMARY_MAIN }}>{acquisition.location_business_name}</Box>
                              </>
                            )}
                          </Typography>
                        ) : (
                          <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                            Scanned a location flyer (that location has since been removed)
                          </Typography>
                        )
                      )}
                      {acquisition.source === 'referral' && (
                        acquisition.referrer_id ? (
                          <Typography variant='body2' sx={{ color: TEXT_HEADING }}>
                            Invited by{' '}
                            <Box component='span' sx={{ fontWeight: 700 }}>{acquisition.referrer_name ?? '—'}</Box>
                            {acquisition.referrer_email && (
                              <Typography component='span' variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                {' '}({acquisition.referrer_email})
                              </Typography>
                            )}
                          </Typography>
                        ) : (
                          <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                            Referred by a user whose account no longer exists
                          </Typography>
                        )
                      )}
                      {acquisition.source === 'promo_code' && (
                        <Typography variant='body2' sx={{ color: TEXT_HEADING }}>
                          Used promo code{' '}
                          <Box component='span' sx={{ fontWeight: 700 }}>{acquisition.promo_code ?? '—'}</Box>
                        </Typography>
                      )}
                      {acquisition.source === 'direct' && (
                        <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                          Signed up directly - no referral link, flyer, or promo code
                        </Typography>
                      )}
                    </Stack>
                    {acquisition.source === 'referral' && (
                      <Chip
                        label={acquisition.referral_rewarded_at
                          ? `Welcome bonus granted ${new Date(acquisition.referral_rewarded_at).toLocaleDateString('en-US')}`
                          : 'Welcome bonus pending phone verification'}
                        size='small'
                        sx={{
                          alignSelf: 'flex-start',
                          bgcolor: acquisition.referral_rewarded_at ? STATUS_ACTIVATED_BG : STATUS_PENDING_BG,
                          color: acquisition.referral_rewarded_at ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
                          fontWeight: 700,
                          borderRadius: '8px',
                          fontSize: 11,
                        }}
                      />
                    )}
                  </Stack>
                ) : (
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                    Unknown - this account predates acquisition tracking
                  </Typography>
                )}
              </AdminCard>
            </motion.div>

            {/* Managed locations (branch managers): which location, at which business */}
            {managedLocations.length > 0 && (
              <motion.div variants={popIn}>
                <AdminCard sx={{ p: 2 }}>
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }} display='block' mb={1.5}>
                    Manages {managedLocations.length === 1 ? 'Location' : `${managedLocations.length} Locations`}
                  </Typography>
                  <Stack spacing={1}>
                    {managedLocations.map((ml) => (
                      <Stack key={ml.location_id} direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
                        <Typography variant='body2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                          {ml.location_name}
                        </Typography>
                        <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                          at
                        </Typography>
                        <Typography variant='body2' fontWeight={600} sx={{ color: PRIMARY_MAIN }}>
                          {ml.business_name}
                        </Typography>
                        {!ml.location_active && (
                          <Chip
                            label='Inactive location'
                            size='small'
                            sx={{ bgcolor: METRIC_WARN_TINT, color: METRIC_WARN, fontWeight: 700, borderRadius: '8px', fontSize: 11 }}
                          />
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </AdminCard>
              </motion.div>
            )}

            {/* Accumulated risk flags */}
            {Array.isArray(user.risk_flags) && user.risk_flags.length > 0 && (
              <motion.div variants={popIn}>
                <AdminCard sx={{ p: 2, borderColor: METRIC_WARN_TINT, bgcolor: METRIC_WARN_TINT }}>
                  <Typography variant='caption' sx={{ color: METRIC_WARN, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }} display='block' mb={1.5}>
                    Risk Signals - Accumulated
                  </Typography>
                  <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
                    {(user.risk_flags as string[]).map((flag) => (
                      <Chip
                        key={flag}
                        label={RISK_FLAG_LABELS[flag] ?? flag}
                        size='small'
                        sx={{
                          bgcolor: 'white',
                          color: METRIC_WARN,
                          fontWeight: 700,
                          borderRadius: '8px',
                          fontSize: 11,
                        }}
                      />
                    ))}
                  </Stack>
                </AdminCard>
              </motion.div>
            )}

            <Divider sx={{ borderColor: BORDER_SUBTLE }} />

            {/* Entry history */}
            <motion.div variants={popIn}>
              <Box>
                <SectionHeader
                  icon={<ConfirmationNumberOutlinedIcon />}
                  tint={METRIC_GOOD_TINT}
                  color={METRIC_GOOD}
                  title={`Entry History (${entries.length})`}
                />

                {entries.length === 0 ? (
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>
                    No entries yet.
                  </Typography>
                ) : (
                  <AdminCard sx={{ p: 0, overflow: 'hidden' }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Campaign</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Source</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Receipt</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Risk +</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Risk Signals</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entries.map((e) => (
                          <TableRow key={e.id} hover sx={{ '&:hover': { bgcolor: BG_ROW_SUBTLE }, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                            <TableCell>
                              <Typography variant='caption' fontWeight={600} noWrap sx={{ color: TEXT_HEADING }}>
                                {e.draw_name ?? '—'}
                              </Typography>
                              {e.business_name && (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} display='block' noWrap>
                                  {e.business_name}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={SOURCE_LABELS[e.entry_source] ?? e.entry_source}
                                size='small'
                                sx={{
                                  fontSize: 11,
                                  borderColor: BORDER_LIGHT,
                                  borderRadius: '8px',
                                  border: `1px solid ${BORDER_LIGHT}`,
                                  bgcolor: 'transparent',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant='caption' sx={{ color: TEXT_HEADING }}>
                                {e.activated_at ? new Date(e.activated_at).toLocaleDateString('en-US') : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {e.is_quarantined ? (
                                <Chip
                                  label={QUARANTINE_LABELS[e.quarantine_reason ?? ''] ?? 'Quarantined'}
                                  size='small'
                                  sx={{
                                    bgcolor: e.quarantine_reason === 'ocr_pending' ? METRIC_WARN_TINT : METRIC_BAD_TINT,
                                    color: e.quarantine_reason === 'ocr_pending' ? METRIC_WARN : METRIC_BAD,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    fontSize: 11,
                                  }}
                                />
                              ) : (
                                <Chip
                                  label='Active'
                                  size='small'
                                  sx={{
                                    bgcolor: STATUS_ACTIVATED_BG,
                                    color: STATUS_ACTIVATED_TEXT,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    fontSize: 11,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {e.receipt_image_url ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                                  <Box
                                    component='a'
                                    href={e.receipt_image_url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    sx={{ display: 'inline-block', lineHeight: 0 }}
                                  >
                                    <Box
                                      component='img'
                                      src={e.receipt_image_url}
                                      alt='Receipt'
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: e.image_validation_status === 'failed' || e.image_validation_status === 'ocr_error' ? METRIC_BAD : e.image_validation_status === 'passed' ? METRIC_GOOD : BORDER_SUBTLE,
                                        cursor: 'pointer',
                                        transition: 'opacity 150ms',
                                        '&:hover': { opacity: 0.8 },
                                      }}
                                    />
                                  </Box>
                                  {e.image_validation_status && e.image_validation_status !== 'not_required' && (
                                    <Chip
                                      label={
                                        e.image_validation_status === 'passed' ? 'OCR ok' :
                                        e.image_validation_status === 'failed' ? 'OCR fail' :
                                        e.image_validation_status === 'ocr_error' ? 'OCR err' :
                                        'OCR pending'
                                      }
                                      size='small'
                                      sx={{
                                        bgcolor:
                                          e.image_validation_status === 'passed' ? STATUS_ACTIVATED_BG :
                                          e.image_validation_status === 'failed' ? METRIC_BAD_TINT :
                                          e.image_validation_status === 'ocr_error' ? METRIC_WARN_TINT :
                                          STATUS_PENDING_BG,
                                        color:
                                          e.image_validation_status === 'passed' ? STATUS_ACTIVATED_TEXT :
                                          e.image_validation_status === 'failed' ? METRIC_BAD :
                                          e.image_validation_status === 'ocr_error' ? METRIC_WARN :
                                          STATUS_PENDING_TEXT,
                                        fontSize: 10,
                                        height: 18,
                                        fontWeight: 700,
                                        borderRadius: '6px',
                                      }}
                                    />
                                  )}
                                  {e.image_validation_status && e.image_validation_status !== 'not_required' && (
                                    <Stack direction='row' spacing={0.25}>
                                      {e.image_validation_status !== 'passed' && (
                                        <IconButton
                                          size='small'
                                          color='success'
                                          disabled={pendingTicket === e.id}
                                          title='Approve image'
                                          onClick={() => {
                                            setPendingTicket(e.id);
                                            imageDecision.mutate({ ticketId: e.id, decision: 'approve' }, { onSettled: () => setPendingTicket(null) });
                                          }}
                                          sx={{ p: 0.25 }}
                                        >
                                          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                      {e.image_validation_status !== 'failed' && (
                                        <IconButton
                                          size='small'
                                          color='error'
                                          disabled={pendingTicket === e.id}
                                          title='Reject image'
                                          onClick={() => {
                                            setPendingTicket(e.id);
                                            imageDecision.mutate({ ticketId: e.id, decision: 'reject' }, { onSettled: () => setPendingTicket(null) });
                                          }}
                                          sx={{ p: 0.25 }}
                                        >
                                          <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                      )}
                                    </Stack>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {e.risk_score_delta !== 0 ? (
                                <Chip
                                  label={e.risk_score_delta > 0 ? `+${e.risk_score_delta}` : `${e.risk_score_delta}`}
                                  size='small'
                                  sx={{
                                    bgcolor: e.risk_score_delta > 0 ? METRIC_BAD_TINT : METRIC_GOOD_TINT,
                                    color: e.risk_score_delta > 0 ? METRIC_BAD : METRIC_GOOD,
                                    fontSize: 11,
                                    height: 20,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                  }}
                                />
                              ) : (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(e.risk_flags) && e.risk_flags.length > 0 ? (
                                <Stack spacing={0.5}>
                                  {(e.risk_flags as string[]).map((flag) => (
                                    <Chip
                                      key={flag}
                                      label={RISK_FLAG_LABELS[flag] ?? flag}
                                      size='small'
                                      sx={{
                                        fontSize: 10,
                                        height: 20,
                                        fontWeight: 700,
                                        bgcolor: METRIC_WARN_TINT,
                                        color: METRIC_WARN,
                                        border: `1px solid ${METRIC_WARN_TINT}`,
                                        borderRadius: '6px',
                                      }}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AdminCard>
                )}
              </Box>
            </motion.div>
            </Stack>
          </motion.div>
        ) : (
          <Typography sx={{ color: TEXT_TERTIARY }}>
            User not found.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default UserDetailDrawer;
