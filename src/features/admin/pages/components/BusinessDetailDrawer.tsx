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
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useBusinessDetail, useAdminImageDecision, useBusinessEntries } from '../../hooks/useAdmin';

interface Props {
  businessId: number | null;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  code: 'Code', receipt: 'Receipt', free: 'Free', promo: 'Promo',
};

const QUARANTINE_LABELS: Record<string, string> = {
  high_risk_user: 'High risk user',
  ocr_pending: 'Image pending review',
  ocr_validation_failed: 'Image rejected',
  ocr_error_pending_review: 'OCR error',
  shared_receipt_suspected: 'Shared receipt',
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
};

const SUB_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success', Trialing: 'warning', Past_Due: 'error', Cancelled: 'error',
};

const ALL = '__all__';

const BusinessDetailDrawer: React.FC<Props> = ({ businessId, onClose }) => {
  const { data, isLoading } = useBusinessDetail(businessId);
  const [selectedDrawId, setSelectedDrawId] = useState<string>(ALL);
  const [entriesPage, setEntriesPage] = useState(1);
  const imageDecision = useAdminImageDecision();
  const [pendingTicket, setPendingTicket] = useState<number | null>(null);

  // Reset both campaign selection and entries page when a different business opens.
  // Collapsed from two chained effects (3 renders) to one (2 renders).
  useEffect(() => {
    setSelectedDrawId(ALL);
    setEntriesPage(1);
  }, [businessId]);

  const biz = data?.business;
  const locations = data?.locations ?? [];
  const campaignSummary = data?.campaignSummary ?? [];

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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant='h6' fontWeight={700}>Business Profile</Typography>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, p: 3 }}>
        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant='circular' width={56} height={56} />
            <Skeleton variant='text' width='55%' height={32} />
            <Skeleton variant='rounded' height={48} />
            <Skeleton variant='rounded' height={90} />
            <Skeleton variant='rounded' height={120} />
            <Skeleton variant='rounded' height={220} />
          </Stack>
        ) : biz ? (
          <Stack spacing={3}>

            {/* Identity */}
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main', fontSize: 22, fontWeight: 700 }}>
                {biz.logo_url
                  ? <Box component='img' src={`${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${biz.logo_url}`} alt={biz.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <StorefrontIcon />}
              </Avatar>
              <Box>
                <Typography variant='h6' fontWeight={700} lineHeight={1.2}>{biz.name}</Typography>
                <Typography variant='body2' color='text.secondary'>{biz.sector}</Typography>
                {biz.description && (
                  <Typography variant='caption' color='text.secondary'>{biz.description}</Typography>
                )}
              </Box>
            </Stack>

            {/* Status chips */}
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Chip label={biz.subscription_status ?? 'No subscription'} size='small' color={SUB_COLORS[biz.subscription_status ?? ''] ?? 'default'} />
              <Chip label={biz.in_open_draw ? 'In active campaign' : 'Not in campaign'} size='small' color={biz.in_open_draw ? 'success' : 'default'} variant={biz.in_open_draw ? 'filled' : 'outlined'} />
              <Chip label={biz.entry_mode === 'receipt' ? 'Receipt entry' : biz.entry_mode ?? '—'} size='small' variant='outlined' />
            </Stack>

            {/* Campaign selector */}
            {campaignSummary.length > 0 && (
              <Autocomplete
                size='small'
                options={campaignSummary}
                getOptionLabel={(opt: any) => opt.draw_name}
                value={campaignSummary.find((c: any) => String(c.draw_id) === selectedDrawId) ?? null}
                onChange={(_, val) => { setSelectedDrawId(val ? String(val.draw_id) : ALL); setEntriesPage(1); }}
                isOptionEqualToValue={(a: any, b: any) => a.draw_id === b.draw_id}
                renderInput={(params) => <TextField {...params} label='Campaign' placeholder='All campaigns' />}
                sx={{ maxWidth: 280 }}
              />
            )}

            {/* Stats — scoped to selected campaign */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1.5 }}>
              {[
                { label: selectedDrawId === ALL ? 'Total Entries' : 'Entries (campaign)', value: activeEntries },
                { label: selectedDrawId === ALL ? 'Quarantined' : 'Quarantined (campaign)', value: quarantinedEntries },
                { label: 'Locations', value: locations.length },
                { label: 'Active Locations', value: locations.filter((l: any) => l.is_active).length },
                { label: 'Fee at Entry', value: biz.fee_at_entry != null ? `$${Number(biz.fee_at_entry).toFixed(2)}` : '—' },
                { label: 'Entry Cap', value: biz.entries_per_location ?? '—' },
                { label: 'Min. Transaction', value: biz.min_transaction_amount ? `$${Number(biz.min_transaction_amount).toFixed(2)}` : '—' },
                { label: 'Member Since', value: new Date(biz.created_at).toLocaleDateString() },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='caption' color='text.secondary' display='block'>{label}</Typography>
                  <Typography variant='body2' fontWeight={700}>{String(value)}</Typography>
                </Box>
              ))}
            </Box>

            {/* Owner info */}
            {biz.owner_name && (
              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant='caption' color='text.secondary' display='block' mb={1} fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Owner
                </Typography>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                    {(biz.owner_name ?? biz.owner_email ?? '?')[0].toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant='body2' fontWeight={600}>{biz.owner_name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{biz.owner_email}</Typography>
                  </Box>
                  <Chip icon={<RiskIcon />} label={`${riskLabel} · ${ownerRisk}`} size='small' color={riskColor} />
                  {!biz.owner_is_active && <Chip label='Inactive' size='small' color='error' variant='outlined' />}
                </Stack>
                {Array.isArray(biz.owner_risk_flags) && biz.owner_risk_flags.length > 0 && (
                  <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5} mt={1}>
                    {(biz.owner_risk_flags as string[]).map((flag) => (
                      <Chip key={flag} label={RISK_FLAG_LABELS[flag] ?? flag} size='small' color='warning' sx={{ fontSize: 11 }} />
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            <Divider />

            {/* Locations — counts scoped to selected campaign */}
            <Box>
              <Stack direction='row' alignItems='center' spacing={1} mb={1.5}>
                <LocationOnIcon fontSize='small' color='action' />
                <Typography variant='subtitle2' fontWeight={700}>Locations ({locations.length})</Typography>
              </Stack>
              <Stack spacing={0.75}>
                {locations.map((loc: any) => {
                  const counts = locEntryCounts.get(loc.id);
                  const active = counts?.active ?? (selectedDrawId === ALL ? Number(loc.activated_tickets) : 0);
                  const quarantined = counts?.quarantined ?? (selectedDrawId === ALL ? Number(loc.quarantined_tickets) : 0);
                  return (
                    <Box key={loc.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: loc.is_active ? 'transparent' : (theme) => alpha(theme.palette.action.disabled, 0.04) }}>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>{loc.name}</Typography>
                        {loc.address && <Typography variant='caption' color='text.secondary'>{loc.address}</Typography>}
                      </Box>
                      <Stack direction='row' spacing={0.75} alignItems='center'>
                        <Chip label={`${active} entries`} size='small' variant='outlined' sx={{ fontSize: 11 }} />
                        {quarantined > 0 && <Chip label={`${quarantined} Q`} size='small' color='warning' sx={{ fontSize: 11 }} />}
                        {!loc.is_active && <Chip label='Inactive' size='small' color='default' variant='outlined' sx={{ fontSize: 11 }} />}
                      </Stack>
                    </Box>
                  );
                })}
                {locations.length === 0 && <Typography variant='body2' color='text.secondary'>No locations on record.</Typography>}
              </Stack>
            </Box>

            <Divider />

            {/* Entry history — scoped to selected campaign */}
            <Box>
              <Stack direction='row' alignItems='center' spacing={1} mb={1.5}>
                <ConfirmationNumberOutlinedIcon fontSize='small' color='action' />
                <Typography variant='subtitle2' fontWeight={700}>
                  {activeCampaign ? `${activeCampaign.draw_name} Entries` : 'All Entries'} ({entriesTotal})
                </Typography>
              </Stack>

              {entriesLoading ? (
                <Stack spacing={1}>
                  {[...Array(5)].map((_, i) => <Skeleton key={i} variant='rounded' height={36} />)}
                </Stack>
              ) : entries.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>No entries{selectedDrawId !== ALL ? ' for this campaign' : ''} yet.</Typography>
              ) : (
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      {selectedDrawId === ALL && <TableCell>Campaign</TableCell>}
                      <TableCell>User</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Receipt</TableCell>
                      <TableCell>Risk +</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((e: any) => (
                      <TableRow key={e.id} hover>
                        {selectedDrawId === ALL && (
                          <TableCell>
                            <Typography variant='caption' fontWeight={600} noWrap>{e.draw_name ?? '—'}</Typography>
                          </TableCell>
                        )}
                        <TableCell sx={{ maxWidth: 140 }}>
                          <Typography variant='caption' fontWeight={600} noWrap display='block'>{e.user_name ?? '—'}</Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>{e.user_email ?? ''}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption' noWrap>{e.location_name ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={SOURCE_LABELS[e.entry_source] ?? e.entry_source} size='small' variant='outlined' sx={{ fontSize: 11 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>
                            {e.transaction_amount != null ? `$${Number(e.transaction_amount).toFixed(2)}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>{e.activated_at ? new Date(e.activated_at).toLocaleDateString() : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {e.is_quarantined ? (
                            <Chip label={QUARANTINE_LABELS[e.quarantine_reason] ?? 'Quarantined'} size='small' color={e.quarantine_reason === 'ocr_pending' ? 'warning' : 'error'} />
                          ) : (
                            <Chip label='Active' size='small' color='success' />
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
                                    width: 48, height: 48, objectFit: 'cover', borderRadius: 1,
                                    border: '1px solid',
                                    borderColor:
                                      e.image_validation_status === 'failed' || e.image_validation_status === 'ocr_error' ? 'error.main'
                                      : e.image_validation_status === 'passed' ? 'success.main' : 'divider',
                                    cursor: 'pointer', '&:hover': { opacity: 0.8 },
                                  }}
                                />
                              </Box>
                              {e.image_validation_status && e.image_validation_status !== 'not_required' && (
                                <Chip
                                  label={e.image_validation_status === 'passed' ? 'OCR ok' : e.image_validation_status === 'failed' ? 'OCR fail' : e.image_validation_status === 'ocr_error' ? 'OCR err' : 'OCR pending'}
                                  size='small'
                                  color={e.image_validation_status === 'passed' ? 'success' : e.image_validation_status === 'failed' ? 'error' : e.image_validation_status === 'ocr_error' ? 'warning' : 'default'}
                                  sx={{ fontSize: 10, height: 18 }}
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
                            <Typography variant='caption' color='text.disabled'>—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {e.risk_score_delta !== 0 ? (
                            <Chip
                              label={e.risk_score_delta > 0 ? `+${e.risk_score_delta}` : `${e.risk_score_delta}`}
                              size='small'
                              color={e.risk_score_delta > 0 ? 'error' : 'success'}
                              sx={{ fontSize: 11, height: 20, fontWeight: 700 }}
                            />
                          ) : (
                            <Typography variant='caption' color='text.disabled'>—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {entriesTotal > 50 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                  <Button size='small' disabled={entriesPage === 1} onClick={() => setEntriesPage(p => p - 1)}>Previous</Button>
                  <Typography variant='caption' color='text.secondary'>
                    Page {entriesPage} of {Math.ceil(entriesTotal / 50)} ({entriesTotal} total)
                  </Typography>
                  <Button size='small' disabled={entriesPage >= Math.ceil(entriesTotal / 50)} onClick={() => setEntriesPage(p => p + 1)}>Next</Button>
                </Box>
              )}
            </Box>

          </Stack>
        ) : (
          <Typography color='text.secondary'>Business not found.</Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default BusinessDetailDrawer;
