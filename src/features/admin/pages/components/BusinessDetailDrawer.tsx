import React, { useState, useEffect } from 'react';
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
  Button,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  PRIMARY_MAIN, PRIMARY_TINT, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, ALPHA_WHITE_80, BG_ROW_SUBTLE,
  TEXT_TERTIARY, TEXT_HEADING, BORDER_SUBTLE, STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG, STATUS_PENDING_TEXT, METRIC_BAD_TINT, METRIC_BAD,
} from '../../../../shared/colors';
import { AdminCard, SectionHeader } from './adminUi';
import { useBusinessDetail, useAdminImageDecision, useBusinessEntries, useUpdateBusinessThreshold } from '../../hooks/useAdmin';

interface Props {
  businessId: number | null;
  onClose: () => void;
}

// 'code' stays only to label legacy tickets from the removed code entry mode.
const SOURCE_LABELS: Record<string, string> = {
  code: 'Code', receipt: 'Receipt', free: 'Weekly', promo: 'Promo', referral: 'Referral',
};

const QUARANTINE_LABELS: Record<string, string> = {
  high_risk_user: 'High risk user',
  ocr_pending: 'Image pending review',
  ocr_validation_failed: 'Image rejected',
  ocr_error_pending_review: 'OCR error',
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
  high_submission_velocity: 'High velocity (>=4/day)',
  elevated_submission_velocity: 'Elevated velocity (>=3/day)',
  sustained_weekly_velocity: 'High weekly volume',
  sustained_monthly_volume: 'High monthly volume',
  rapid_submission: 'Rapid re-submit (<30s)',
  sequential_guessing: 'Sequential guessing',
  threshold_probing: 'Threshold probing',
  amount_outlier: 'Amount outlier (>3x avg)',
  suspiciously_fast_input: 'Suspiciously fast input',
  superseded_duplicate_receipt: 'Duplicate receipt (owner verified theirs)',
  duplicate_document: 'Reused receipt (different number, same image)',
  same_business_receipt_velocity: 'Many verified receipts at one business (24h)',
};

const SUB_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success', Trialing: 'warning', Past_Due: 'error', Cancelled: 'error',
};

const ALL = '__all__';

const BusinessDetailDrawer: React.FC<Props> = ({ businessId, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useBusinessDetail(businessId);
  const [selectedDrawId, setSelectedDrawId] = useState<string>(ALL);
  const [entriesPage, setEntriesPage] = useState(1);
  const imageDecision = useAdminImageDecision();
  const [pendingTicket, setPendingTicket] = useState<number | null>(null);
  const [thresholdOpen, setThresholdOpen] = useState(false);

  // Reset both campaign selection and entries page when a different business opens.
  // Collapsed from two chained effects (3 renders) to one (2 renders).
  useEffect(() => {
    setSelectedDrawId(ALL);
    setEntriesPage(1);
  }, [businessId]);

  const biz = data?.business;
  const locations = data?.locations ?? [];
  const campaignSummary = data?.campaignSummary ?? [];

  const handleViewDashboard = () => {
    if (businessId) {
      navigate(`/admin/businesses/${businessId}/view`);
      onClose();
    }
  };

  const drawIdForEntries = selectedDrawId !== ALL ? parseInt(selectedDrawId, 10) : null;
  const { data: entriesData, isLoading: entriesLoading } = useBusinessEntries(businessId, drawIdForEntries, entriesPage);
  const entries = entriesData?.rows ?? [];
  const entriesTotal = entriesData?.total ?? 0;

  // Recompute per-location counts from current page entries (UI approximation)
  const locEntryCounts = new Map<number, { active: number; quarantined: number }>();
  for (const e of entries) {
    if (!e.location_id) continue;
    const cur = locEntryCounts.get(e.location_id) ?? { active: 0, quarantined: 0 };
    if (e.is_quarantined) cur.quarantined++; else cur.active++;
    locEntryCounts.set(e.location_id, cur);
  }

  const activeCampaign = selectedDrawId !== ALL
    ? campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId)
    : null;

  const ownerRisk = biz?.owner_risk_score ?? 0;
  const riskColor: 'error' | 'warning' | 'success' =
    ownerRisk >= 20 ? 'error' : ownerRisk >= 10 ? 'warning' : 'success';
  const riskLabel = ownerRisk >= 20 ? 'HIGH' : ownerRisk >= 10 ? 'MEDIUM' : 'LOW';
  const RiskIcon = ownerRisk >= 20 ? GppBadIcon : ownerRisk >= 10 ? WarningIcon : VerifiedUserIcon;

  const activeEntries = selectedDrawId === ALL
    ? campaignSummary.reduce((s: number, c: any) => s + c.count - c.quarantined, 0)
    : (campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId)?.count ?? 0) - (campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId)?.quarantined ?? 0);
  const quarantinedEntries = selectedDrawId === ALL
    ? campaignSummary.reduce((s: number, c: any) => s + c.quarantined, 0)
    : campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId)?.quarantined ?? 0;

  return (
    <Drawer
      anchor='right'
      open={businessId !== null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 620, md: 920, lg: 1020 }, p: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Hero Header with gradient background */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          px: 3, py: 4,
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          borderRadius: '20px 0 0 20px',
        }}
      >
        {/* Glow orb detail */}
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 70%)`,
            top: -80,
            right: -80,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: ALPHA_WHITE_15,
                border: `2px solid ${ALPHA_WHITE_30}`,
                flexShrink: 0,
              }}
            >
              {biz?.logo_url
                ? <Box component='img' src={`${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${biz.logo_url}`} alt={biz?.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <StorefrontIcon sx={{ color: 'white' }} />}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant='h6' fontWeight={800} sx={{ color: 'white', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {biz?.name ?? 'Loading...'}
              </Typography>
              <Typography variant='body2' sx={{ color: ALPHA_WHITE_80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {biz?.sector ?? ''}
              </Typography>
            </Box>
          </Box>
          <Stack direction='row' spacing={0.75} sx={{ flexShrink: 0 }}>
            <Button
              size='small'
              onClick={handleViewDashboard}
              disabled={isLoading}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.75,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' },
                '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.5)' },
              }}
            >
              Dashboard
            </Button>
            <IconButton onClick={onClose} size='small' sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, p: 3 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant='rounded' height={100} />
            <Skeleton variant='rounded' height={100} />
            <Skeleton variant='rounded' height={200} />
          </Stack>
        ) : biz ? (
          <Stack spacing={3}>

            {/* Status chips */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <Stack direction='row' spacing={1} flexWrap='wrap'>
                <Chip
                  label={biz.subscription_status ?? 'No subscription'}
                  size='small'
                  sx={{
                    bgcolor: SUB_COLORS[biz.subscription_status ?? ''] === 'success' ? STATUS_ACTIVATED_BG : SUB_COLORS[biz.subscription_status ?? ''] === 'warning' ? STATUS_PENDING_BG : METRIC_BAD_TINT,
                    color: SUB_COLORS[biz.subscription_status ?? ''] === 'success' ? STATUS_ACTIVATED_TEXT : SUB_COLORS[biz.subscription_status ?? ''] === 'warning' ? STATUS_PENDING_TEXT : METRIC_BAD,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={biz.in_open_draw ? 'In active campaign' : 'Not in campaign'}
                  size='small'
                  sx={{
                    bgcolor: biz.in_open_draw ? STATUS_ACTIVATED_BG : 'transparent',
                    color: biz.in_open_draw ? STATUS_ACTIVATED_TEXT : TEXT_TERTIARY,
                    border: biz.in_open_draw ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                />
              </Stack>
            </motion.div>

            {/* Campaign selector */}
            {campaignSummary.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                <Autocomplete
                  size='small'
                  options={campaignSummary}
                  getOptionLabel={(opt: any) => opt.draw_name}
                  value={campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId) ?? null}
                  onChange={(_, val) => { setSelectedDrawId(val ? String(val.draw_id) : ALL); setEntriesPage(1); }}
                  isOptionEqualToValue={(a: any, b: any) => a.draw_id === b.draw_id}
                  renderInput={(params) => <TextField {...params} label='Campaign' placeholder='All campaigns' />}
                  sx={{ maxWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </motion.div>
            )}

            {/* Stats — scoped to selected campaign */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
                {([
                  { label: selectedDrawId === ALL ? 'Total Entries' : 'Entries (campaign)', value: activeEntries },
                  { label: selectedDrawId === ALL ? 'Quarantined' : 'Quarantined (campaign)', value: quarantinedEntries },
                  { label: 'Locations', value: locations.length },
                  { label: 'Active Locations', value: locations.filter((l: any) => l.is_active).length },
                  { label: 'Fee at Entry', value: biz.fee_at_entry != null ? `$${Number(biz.fee_at_entry).toFixed(2)}` : '—' },
                  { label: 'Entry Cap', value: biz.entries_per_location ?? '—' },
                  { label: 'Min. Transaction', value: biz.min_transaction_amount ? `$${Number(biz.min_transaction_amount).toFixed(2)}` : '—', editable: true },
                  { label: 'Campaign Min.', value: biz.open_draw_min_transaction != null ? `$${Number(biz.open_draw_min_transaction).toFixed(2)}` : '—', editable: true },
                  { label: 'Legal Name', value: biz.legal_name ?? '—' },
                  { label: 'Member Since', value: new Date(biz.created_at).toLocaleDateString('en-US') },
                ] as Array<{ label: string; value: string | number; editable?: boolean }>).map(({ label, value, editable }) => (
                  <AdminCard key={label} sx={{ p: 1.5, position: 'relative' }}>
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', fontWeight: 700 }}>{label}</Typography>
                    <Typography variant='body2' fontWeight={800} sx={{ color: TEXT_HEADING, mt: 0.5 }}>{String(value)}</Typography>
                    {editable && (
                      <IconButton
                        size='small'
                        aria-label={`Edit ${label}`}
                        onClick={() => setThresholdOpen(true)}
                        sx={{ position: 'absolute', top: 4, right: 4, p: 0.5 }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 15, color: TEXT_TERTIARY }} />
                      </IconButton>
                    )}
                  </AdminCard>
                ))}
              </Box>
            </motion.div>

            {/* Owner info */}
            {biz.owner_name && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                <AdminCard sx={{ p: 2 }}>
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mb: 1, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Owner
                  </Typography>
                  <Stack direction='row' spacing={1.5} alignItems='center'>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: PRIMARY_MAIN, fontSize: 14 }}>
                      {(biz.owner_name ?? biz.owner_email ?? '?')[0].toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant='body2' fontWeight={600} sx={{ color: TEXT_HEADING }}>{biz.owner_name}</Typography>
                      <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>{biz.owner_email}</Typography>
                    </Box>
                    <Chip
                      icon={<RiskIcon />}
                      label={`${riskLabel} - ${ownerRisk}`}
                      size='small'
                      sx={{
                        bgcolor: riskColor === 'error' ? METRIC_BAD_TINT : riskColor === 'warning' ? STATUS_PENDING_BG : STATUS_ACTIVATED_BG,
                        color: riskColor === 'error' ? METRIC_BAD : riskColor === 'warning' ? STATUS_PENDING_TEXT : STATUS_ACTIVATED_TEXT,
                        fontWeight: 700,
                        borderRadius: '8px',
                      }}
                    />
                    {!biz.owner_is_active && (
                      <Chip
                        label='Inactive'
                        size='small'
                        sx={{
                          bgcolor: METRIC_BAD_TINT,
                          color: METRIC_BAD,
                          fontWeight: 700,
                          borderRadius: '8px',
                        }}
                      />
                    )}
                  </Stack>
                  {Array.isArray(biz.owner_risk_flags) && biz.owner_risk_flags.length > 0 && (
                    <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5} mt={1}>
                      {(biz.owner_risk_flags as string[]).map((flag) => (
                        <Chip
                          key={flag}
                          label={RISK_FLAG_LABELS[flag] ?? flag}
                          size='small'
                          sx={{
                            bgcolor: STATUS_PENDING_BG,
                            color: STATUS_PENDING_TEXT,
                            fontWeight: 700,
                            fontSize: 11,
                            borderRadius: '8px',
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </AdminCard>
              </motion.div>
            )}

            <Divider sx={{ borderColor: BORDER_SUBTLE }} />

            {/* Locations — counts scoped to selected campaign */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <SectionHeader icon={<LocationOnIcon />} tint={PRIMARY_TINT} color={PRIMARY_MAIN} title={`Locations (${locations.length})`} />
              <Stack spacing={1}>
                {locations.map((loc: any) => {
                  const counts = locEntryCounts.get(loc.id);
                  const active = counts?.active ?? (selectedDrawId === ALL ? Number(loc.activated_tickets) : 0);
                  const quarantined = counts?.quarantined ?? (selectedDrawId === ALL ? Number(loc.quarantined_tickets) : 0);
                  return (
                    <AdminCard
                      key={loc.id}
                      sx={{
                        p: 1.5,
                        bgcolor: loc.is_active ? 'transparent' : (theme) => alpha(theme.palette.action.disabled, 0.04),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant='body2' fontWeight={600} sx={{ color: TEXT_HEADING }}>{loc.name}</Typography>
                          {loc.address && <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>{loc.address}</Typography>}
                        </Box>
                        <Stack direction='row' spacing={0.75} alignItems='center'>
                          <Chip
                            label={`${active} entries`}
                            size='small'
                            sx={{
                              bgcolor: 'transparent',
                              border: `1px solid ${BORDER_SUBTLE}`,
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: '8px',
                            }}
                          />
                          {quarantined > 0 && (
                            <Chip
                              label={`${quarantined} Q`}
                              size='small'
                              sx={{
                                bgcolor: STATUS_PENDING_BG,
                                color: STATUS_PENDING_TEXT,
                                fontSize: 11,
                                fontWeight: 600,
                                borderRadius: '8px',
                              }}
                            />
                          )}
                          {!loc.is_active && (
                            <Chip
                              label='Inactive'
                              size='small'
                              sx={{
                                bgcolor: 'transparent',
                                border: `1px solid ${BORDER_SUBTLE}`,
                                fontSize: 11,
                                fontWeight: 600,
                                borderRadius: '8px',
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </AdminCard>
                  );
                })}
                {locations.length === 0 && <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>No locations on record.</Typography>}
              </Stack>
            </motion.div>

            <Divider sx={{ borderColor: BORDER_SUBTLE }} />

            {/* Entry history — scoped to selected campaign */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <SectionHeader icon={<ConfirmationNumberOutlinedIcon />} tint={PRIMARY_TINT} color={PRIMARY_MAIN} title={activeCampaign ? `${activeCampaign.draw_name} Entries (${entriesTotal})` : `All Entries (${entriesTotal})`} />
            </motion.div>

            {entriesLoading ? (
              <Stack spacing={1}>
                {[...Array(5)].map((_, i) => <Skeleton key={i} variant='rounded' height={36} />)}
              </Stack>
            ) : entries.length === 0 ? (
              <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>No entries{selectedDrawId !== ALL ? ' for this campaign' : ''} yet.</Typography>
            ) : (
              <AdminCard sx={{ overflow: 'hidden' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                      {selectedDrawId === ALL && <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Campaign</TableCell>}
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Receipt</TableCell>
                      <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 11 }}>Risk</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((e: any, idx: number) => (
                      <TableRow
                        key={e.id}
                        sx={{
                          '&:hover': { bgcolor: BG_ROW_SUBTLE },
                          borderBottom: idx < entries.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                        }}
                      >
                        {selectedDrawId === ALL && (
                          <TableCell>
                            <Typography variant='caption' fontWeight={600} noWrap sx={{ color: TEXT_HEADING }}>{e.draw_name ?? '—'}</Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ maxWidth: 140 }}>
                          <Typography variant='caption' fontWeight={600} noWrap display='block' sx={{ color: TEXT_HEADING }}>{e.user_name ?? '—'}</Typography>
                          <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap>{e.user_email ?? ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' noWrap sx={{ color: TEXT_HEADING }}>{e.location_name ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={SOURCE_LABELS[e.entry_source] ?? e.entry_source}
                            size='small'
                            sx={{
                              bgcolor: 'transparent',
                              border: `1px solid ${BORDER_SUBTLE}`,
                              fontSize: 11,
                              fontWeight: 600,
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ color: TEXT_HEADING, fontWeight: 600 }}>
                            {e.transaction_amount != null ? `$${Number(e.transaction_amount).toFixed(2)}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' sx={{ color: TEXT_HEADING }}>{e.activated_at ? new Date(e.activated_at).toLocaleDateString('en-US') : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {e.is_quarantined ? (
                            <Chip
                              label={QUARANTINE_LABELS[e.quarantine_reason] ?? 'Quarantined'}
                              size='small'
                              sx={{
                                bgcolor: e.quarantine_reason === 'ocr_pending' ? STATUS_PENDING_BG : METRIC_BAD_TINT,
                                color: e.quarantine_reason === 'ocr_pending' ? STATUS_PENDING_TEXT : METRIC_BAD,
                                fontWeight: 700,
                                fontSize: 11,
                                borderRadius: '8px',
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
                                fontSize: 11,
                                borderRadius: '8px',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {e.receipt_image_url ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                              <Box component='a' href={e.receipt_image_url} target='_blank' rel='noopener noreferrer'>
                                <Box
                                  component='img'
                                  src={e.receipt_image_url}
                                  alt='Receipt'
                                  sx={{
                                    width: 48, height: 48, objectFit: 'cover', borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor:
                                      e.image_validation_status === 'failed' || e.image_validation_status === 'ocr_error' ? METRIC_BAD
                                      : e.image_validation_status === 'passed' ? STATUS_ACTIVATED_TEXT : BORDER_SUBTLE,
                                    cursor: 'pointer', '&:hover': { opacity: 0.8 },
                                  }}
                                />
                              </Box>
                              {e.image_validation_status && e.image_validation_status !== 'not_required' && (
                                <Chip
                                  label={e.image_validation_status === 'passed' ? 'OCR ok' : e.image_validation_status === 'failed' ? 'OCR fail' : e.image_validation_status === 'ocr_error' ? 'OCR err' : 'OCR pending'}
                                  size='small'
                                  sx={{
                                    bgcolor: e.image_validation_status === 'passed' ? STATUS_ACTIVATED_BG : e.image_validation_status === 'failed' ? METRIC_BAD_TINT : STATUS_PENDING_BG,
                                    color: e.image_validation_status === 'passed' ? STATUS_ACTIVATED_TEXT : e.image_validation_status === 'failed' ? METRIC_BAD : STATUS_PENDING_TEXT,
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
                                      disabled={pendingTicket === e.id}
                                      title='Approve image'
                                      onClick={() => {
                                        setPendingTicket(e.id);
                                        imageDecision.mutate({ ticketId: e.id, decision: 'approve' }, { onSettled: () => setPendingTicket(null) });
                                      }}
                                      sx={{ p: 0.25, color: STATUS_ACTIVATED_TEXT }}
                                    >
                                      <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  )}
                                  {e.image_validation_status !== 'failed' && (
                                    <IconButton
                                      size='small'
                                      disabled={pendingTicket === e.id}
                                      title='Reject image'
                                      onClick={() => {
                                        setPendingTicket(e.id);
                                        imageDecision.mutate({ ticketId: e.id, decision: 'reject' }, { onSettled: () => setPendingTicket(null) });
                                      }}
                                      sx={{ p: 0.25, color: METRIC_BAD }}
                                    >
                                      <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  )}
                                </Stack>
                              )}
                            </Box>
                          ) : (
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {e.risk_score_delta !== 0 ? (
                            <Chip
                              label={e.risk_score_delta > 0 ? `+${e.risk_score_delta}` : `${e.risk_score_delta}`}
                              size='small'
                              sx={{
                                bgcolor: e.risk_score_delta > 0 ? METRIC_BAD_TINT : STATUS_ACTIVATED_BG,
                                color: e.risk_score_delta > 0 ? METRIC_BAD : STATUS_ACTIVATED_TEXT,
                                fontSize: 11,
                                height: 20,
                                fontWeight: 700,
                                borderRadius: '8px',
                              }}
                            />
                          ) : (
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AdminCard>
            )}
            {entriesTotal > 50 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                <Button
                  size='small'
                  disabled={entriesPage === 1}
                  onClick={() => setEntriesPage(p => p - 1)}
                  sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_MAIN }}
                >
                  Previous
                </Button>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                  Page {entriesPage} of {Math.ceil(entriesTotal / 50)} ({entriesTotal} total)
                </Typography>
                <Button
                  size='small'
                  disabled={entriesPage >= Math.ceil(entriesTotal / 50)}
                  onClick={() => setEntriesPage(p => p + 1)}
                  sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_MAIN }}
                >
                  Next
                </Button>
              </Box>
            )}

          </Stack>
        ) : (
          <Typography color='text.secondary'>Business not found.</Typography>
        )}
      </Box>

      {/* Conditional render so each open remounts with fresh field state from the latest data */}
      {biz && businessId !== null && thresholdOpen && (
        <ThresholdEditDialog
          businessId={businessId}
          currentMin={biz.min_transaction_amount != null ? Number(biz.min_transaction_amount) : null}
          currentDrawMin={biz.open_draw_min_transaction != null ? Number(biz.open_draw_min_transaction) : null}
          pendingMin={biz.pending_min_transaction_amount != null ? Number(biz.pending_min_transaction_amount) : null}
          inOpenDraw={biz.in_open_draw === true}
          onClose={() => setThresholdOpen(false)}
        />
      )}
    </Drawer>
  );
};

// ── Threshold edit dialog ─────────────────────────────────────────────────────
// Admin override for both threshold values:
//  - Business threshold (business.min_transaction_amount): enforcement reads it LIVE,
//    so the change applies to new entries immediately (no owner-style pending dance).
//  - Campaign threshold (draw_entry.min_transaction_at_entry on the open draw): the
//    snapshot per-campaign analytics display; editable only while in an open campaign.
interface ThresholdEditDialogProps {
  businessId: number;
  currentMin: number | null;
  currentDrawMin: number | null;
  pendingMin: number | null;
  inOpenDraw: boolean;
  onClose: () => void;
}

const ThresholdEditDialog: React.FC<ThresholdEditDialogProps> = ({
  businessId, currentMin, currentDrawMin, pendingMin, inOpenDraw, onClose,
}) => {
  const [minTx, setMinTx] = useState(currentMin != null ? String(currentMin) : '');
  const [drawMinTx, setDrawMinTx] = useState(currentDrawMin != null ? String(currentDrawMin) : '');
  const [error, setError] = useState<string | null>(null);
  const mutation = useUpdateBusinessThreshold();

  const parseField = (raw: string): number | null | undefined => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const n = parseFloat(trimmed);
    if (!Number.isFinite(n) || n <= 0 || n > 100000) return null;
    return Math.round(n * 100) / 100;
  };

  const handleSave = () => {
    setError(null);
    const min = parseField(minTx);
    const drawMin = inOpenDraw ? parseField(drawMinTx) : undefined;
    if (min === null || drawMin === null) {
      setError('Thresholds must be between $0.01 and $100,000.');
      return;
    }
    // Send only what actually changed - the campaign update 400s when not enrolled,
    // and an unchanged value is not a change worth writing.
    const payload: { businessId: number; minTransactionAmount?: number; drawEntryMinTransaction?: number } = { businessId };
    if (min !== undefined && min !== currentMin) payload.minTransactionAmount = min;
    if (drawMin !== undefined && drawMin !== currentDrawMin) payload.drawEntryMinTransaction = drawMin;
    if (payload.minTransactionAmount === undefined && payload.drawEntryMinTransaction === undefined) {
      onClose();
      return;
    }
    mutation.mutate(payload, {
      onSuccess: onClose,
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
        setError(msg ?? 'Failed to update thresholds. Please try again.');
      },
    });
  };

  return (
    <Dialog open onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontWeight: 800, color: TEXT_HEADING, pb: 1 }}>Edit thresholds</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label='Business threshold'
            value={minTx}
            onChange={(e) => setMinTx(e.target.value)}
            size='small'
            type='number'
            slotProps={{ input: { startAdornment: <InputAdornment position='start'>$</InputAdornment> } }}
            helperText='Applies to new entries immediately.'
          />
          <TextField
            label='Current campaign threshold'
            value={drawMinTx}
            onChange={(e) => setDrawMinTx(e.target.value)}
            size='small'
            type='number'
            disabled={!inOpenDraw}
            slotProps={{ input: { startAdornment: <InputAdornment position='start'>$</InputAdornment> } }}
            helperText={inOpenDraw
              ? 'The threshold recorded for the open campaign (shown in per-campaign analytics).'
              : 'Not in an open campaign.'}
          />
          {pendingMin != null && (
            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
              The owner has a queued change to ${pendingMin.toFixed(2)} that will apply when the campaign closes.
            </Typography>
          )}
          {error && (
            <Typography variant='caption' sx={{ color: METRIC_BAD, fontWeight: 600 }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={mutation.isPending} sx={{ textTransform: 'none', fontWeight: 600, color: TEXT_TERTIARY }}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={mutation.isPending}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BusinessDetailDrawer;
