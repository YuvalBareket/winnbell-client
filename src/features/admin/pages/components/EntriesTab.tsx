import React, { useState } from 'react';
import {
  Box,
  Stack,
  Grid,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { motion } from 'framer-motion';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { AdminCard, StatCard, StatCardSkeleton, AdminCardSkeleton, SectionHeader, IconTile } from './adminUi';
import { useAdminEntries, useAdminImageDecision } from '../../hooks/useAdmin';
import type { AdminEntryRow } from '../../hooks/useAdmin';
import type { Draw } from '../../types/admin.types';
import {
  QUARANTINE_LABELS, RISK_FLAG_LABELS, IMAGE_STATUS_LABELS,
} from '../../constants/entryLabels';
import { staggerContainer, riseIn } from '../../../../shared/motion';
import {
  PRIMARY_MAIN, PRIMARY_TINT,
  METRIC_GOOD, METRIC_GOOD_TINT, METRIC_WARN, METRIC_WARN_TINT, METRIC_BAD, METRIC_BAD_TINT,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, BORDER_SUBTLE, BORDER_LIGHT, BG_ROW_SUBTLE,
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT, STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  GOLD_INK,
} from '../../../../shared/colors';

// Amber chips (warn reasons, OCR errors, risk flags) sit on the pale METRIC_WARN_TINT: orange
// text there is only 2.4:1, so small chip text uses GOLD_INK (dark on the amber tint, AA-safe).
// The tinted StatCard ICONS keep METRIC_WARN - the color-contrast rule applies to text, not icons.
const WARN_CHIP_TEXT = GOLD_INK;

interface Props {
  draws?: Draw[];
  isMobile: boolean;
  onSnackError: (msg: string) => void;
  onSnackSuccess: (msg: string) => void;
}

const ALL_DRAWS = '__all__';
const PAGE_SIZE = 25;

// The filterable views. 'failed' (Rejected) is the actionable queue and the default landing
// state - the admin looks through auto-rejected entries and approves any wrongly rejected.
const STATUS_FILTERS: ReadonlyArray<readonly [key: string, label: string]> = [
  ['failed', 'Rejected'],
  ['all', 'All'],
  ['passed', 'Verified'],
  ['quarantined', 'Quarantined'],
];

const money = (v: number | null): string =>
  v == null ? '-' : `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const imageStatusChipSx = (status: string) => {
  if (status === 'passed') return { bg: STATUS_ACTIVATED_BG, color: STATUS_ACTIVATED_TEXT };
  if (status === 'failed') return { bg: METRIC_BAD_TINT, color: METRIC_BAD };
  if (status === 'ocr_error') return { bg: METRIC_WARN_TINT, color: WARN_CHIP_TEXT };
  return { bg: STATUS_PENDING_BG, color: STATUS_PENDING_TEXT };
};

const EntriesTab: React.FC<Props> = ({ draws, isMobile, onSnackError, onSnackSuccess }) => {
  const [userPickedDraw, setUserPickedDraw] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('failed');
  const [page, setPage] = useState(1);
  const [pendingTicket, setPendingTicket] = useState<number | null>(null);

  // Default the campaign filter to the current Open campaign once the draws list loads; the
  // user's own pick (including "All campaigns") overrides it. Derived from props, so there is
  // no effect and no state-sync race.
  const openDraw = (draws ?? []).find((d) => d.status?.toUpperCase() === 'OPEN');
  const selectedDraw = userPickedDraw ?? (openDraw ? String(openDraw.id) : ALL_DRAWS);
  const drawsResolved = draws !== undefined;

  const drawId = selectedDraw !== ALL_DRAWS ? parseInt(selectedDraw, 10) : null;
  // Hold the first fetch until the draws list resolves, so the initial load already targets
  // the current campaign instead of flashing "all campaigns" then re-fetching.
  const { data, isLoading, isFetching } = useAdminEntries(drawId, status, page, drawsResolved);
  const imageDecision = useAdminImageDecision();
  const loading = !drawsResolved || isLoading;

  // A new campaign or status view starts on page 1. Reset in the handlers (not an effect)
  // so the page change lands in the same render as the filter change.
  const changeDraw = (value: string) => { setUserPickedDraw(value); setPage(1); };
  const changeStatus = (value: string) => { setStatus(value); setPage(1); };

  const stats = data?.stats;
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const decide = (ticketId: number, decision: 'approve' | 'reject') => {
    setPendingTicket(ticketId);
    imageDecision.mutate(
      { ticketId, decision },
      {
        onSuccess: () => onSnackSuccess(decision === 'approve' ? 'Entry approved.' : 'Entry rejected.'),
        onError: () => onSnackError('Could not update this entry. Please try again.'),
        onSettled: () => setPendingTicket(null),
      },
    );
  };

  const STAT_CARDS = [
    { icon: <ReceiptLongIcon />, tint: PRIMARY_TINT, color: PRIMARY_MAIN, label: 'Total entries', value: stats?.total ?? 0, caption: `${stats?.with_image ?? 0} with a photo` },
    { icon: <BlockIcon />, tint: METRIC_BAD_TINT, color: METRIC_BAD, label: 'Rejected', value: stats?.rejected ?? 0, caption: 'Approve any wrongly rejected' },
    { icon: <VerifiedIcon />, tint: METRIC_GOOD_TINT, color: METRIC_GOOD, label: 'Verified', value: stats?.verified ?? 0, caption: 'Photo checked, in the draw' },
    { icon: <ConfirmationNumberOutlinedIcon />, tint: METRIC_GOOD_TINT, color: METRIC_GOOD, label: 'In the draw', value: stats?.active ?? 0, caption: 'Active, can win' },
    { icon: <Inventory2OutlinedIcon />, tint: METRIC_WARN_TINT, color: METRIC_WARN, label: 'Held out', value: stats?.quarantined ?? 0, caption: 'Quarantined, not drawn' },
  ];

  return (
    <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
      <Stack spacing={3}>
        {/* Campaign filter */}
        <motion.div variants={riseIn}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
          >
            <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
              Review receipt photos and approve or reject entries. Filter by campaign to focus on one draw.
            </Typography>
            <FormControl size='small' sx={{ minWidth: 220 }}>
              <InputLabel id='entries-campaign-label'>Campaign</InputLabel>
              <Select
                labelId='entries-campaign-label'
                label='Campaign'
                value={selectedDraw}
                onChange={(e: SelectChangeEvent) => changeDraw(e.target.value)}
                sx={{ borderRadius: '10px', bgcolor: 'white' }}
              >
                <MenuItem value={ALL_DRAWS}>All campaigns</MenuItem>
                {(draws ?? []).map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.name}{d.status === 'Open' ? ' (Open)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <Grid container spacing={isMobile ? 1.5 : 2}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
                <StatCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : (
          <motion.div variants={staggerContainer}>
            <Grid container spacing={isMobile ? 1.5 : 2}>
              {STAT_CARDS.map((c) => (
                <Grid key={c.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
                  <StatCard icon={c.icon} tint={c.tint} color={c.color} label={c.label} value={c.value} caption={c.caption} />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {/* Helpful knowledge */}
        <motion.div variants={riseIn}>
          <AdminCard sx={{ p: 2, bgcolor: PRIMARY_TINT, borderColor: PRIMARY_TINT }}>
            <Stack direction='row' spacing={1.5} alignItems='flex-start'>
              <IconTile icon={<InfoOutlinedIcon />} tint='white' color={PRIMARY_MAIN} size={36} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' sx={{ fontWeight: 700, color: TEXT_HEADING }}>
                  How review works
                </Typography>
                <Typography variant='caption' sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.5, lineHeight: 1.6 }}>
                  Every receipt photo is checked automatically. Rejected entries are the ones that
                  failed that check. Look through them and approve any that were rejected by mistake.
                  Approving puts the entry back in the draw and overrides the automatic decision.
                  Verified entries already passed and need nothing from you.
                </Typography>
              </Box>
            </Stack>
          </AdminCard>
        </motion.div>

        {/* Status filter + list */}
        <motion.div variants={riseIn}>
          <Box>
            <SectionHeader
              icon={<ConfirmationNumberOutlinedIcon />}
              tint={METRIC_GOOD_TINT}
              color={METRIC_GOOD}
              title='Entries'
            />

            <Stack direction='row' spacing={0.75} flexWrap='wrap' gap={0.75} mb={2}>
              {STATUS_FILTERS.map(([key, label]) => {
                const selected = status === key;
                return (
                  <Chip
                    key={key}
                    label={label}
                    onClick={() => changeStatus(key)}
                    size='small'
                    sx={{
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      bgcolor: selected ? PRIMARY_MAIN : 'transparent',
                      color: selected ? 'white' : TEXT_SECONDARY,
                      border: `1px solid ${selected ? PRIMARY_MAIN : BORDER_LIGHT}`,
                      '&:hover': { bgcolor: selected ? PRIMARY_MAIN : BG_ROW_SUBTLE },
                    }}
                  />
                );
              })}
            </Stack>

            {loading ? (
              <AdminCardSkeleton height={320} />
            ) : rows.length === 0 ? (
              <AdminCard sx={{ p: 4 }}>
                <Typography variant='body2' sx={{ color: TEXT_TERTIARY, textAlign: 'center' }}>
                  No entries match this view.
                </Typography>
              </AdminCard>
            ) : (
              <AdminCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size='small' sx={{ minWidth: 860 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                        {['Entry', 'Customer', 'Business', 'Date', 'Amount', 'Status', 'Receipt', 'Risk'].map((h) => (
                          <TableCell
                            key={h}
                            sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((e: AdminEntryRow) => {
                        const imgStatus = e.image_validation_status;
                        const showActions = !!imgStatus && imgStatus !== 'not_required';
                        return (
                          <TableRow key={e.id} hover sx={{ '&:hover': { bgcolor: BG_ROW_SUBTLE }, borderBottom: `1px solid ${BORDER_SUBTLE}` }}>
                            {/* Entry */}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant='caption' fontWeight={700} sx={{ color: TEXT_HEADING }} display='block'>
                                {e.draw_name ?? '-'}
                              </Typography>
                              {e.receipt_identifier && (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                  #{e.receipt_identifier}
                                </Typography>
                              )}
                            </TableCell>
                            {/* Customer */}
                            <TableCell sx={{ maxWidth: 180 }}>
                              <Typography variant='caption' fontWeight={600} noWrap sx={{ color: TEXT_HEADING }} display='block'>
                                {e.user_name ?? '-'}
                              </Typography>
                              {e.user_email && (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap display='block'>
                                  {e.user_email}
                                </Typography>
                              )}
                            </TableCell>
                            {/* Business */}
                            <TableCell sx={{ maxWidth: 160 }}>
                              <Typography variant='caption' fontWeight={600} noWrap sx={{ color: TEXT_HEADING }} display='block'>
                                {e.business_name ?? '-'}
                              </Typography>
                              {e.location_name && (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap display='block'>
                                  {e.location_name}
                                </Typography>
                              )}
                            </TableCell>
                            {/* Date */}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant='caption' sx={{ color: TEXT_HEADING }}>
                                {e.transaction_date ?? (e.activated_at ? new Date(e.activated_at).toLocaleDateString('en-US') : '-')}
                              </Typography>
                            </TableCell>
                            {/* Amount */}
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant='caption' fontWeight={600} sx={{ color: TEXT_HEADING }}>
                                {money(e.transaction_amount)}
                              </Typography>
                            </TableCell>
                            {/* Status */}
                            <TableCell>
                              {e.is_quarantined ? (
                                <Chip
                                  label={QUARANTINE_LABELS[e.quarantine_reason ?? ''] ?? 'Quarantined'}
                                  size='small'
                                  sx={{
                                    bgcolor: e.quarantine_reason === 'ocr_pending' || e.quarantine_reason === 'date_unreadable_review' || e.quarantine_reason === 'contest_pending' ? METRIC_WARN_TINT : METRIC_BAD_TINT,
                                    color: e.quarantine_reason === 'ocr_pending' || e.quarantine_reason === 'date_unreadable_review' || e.quarantine_reason === 'contest_pending' ? WARN_CHIP_TEXT : METRIC_BAD,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    fontSize: 11,
                                  }}
                                />
                              ) : (
                                <Chip
                                  label='Active'
                                  size='small'
                                  sx={{ bgcolor: STATUS_ACTIVATED_BG, color: STATUS_ACTIVATED_TEXT, fontWeight: 700, borderRadius: '8px', fontSize: 11 }}
                                />
                              )}
                            </TableCell>
                            {/* Receipt image + approve/reject */}
                            <TableCell>
                              {e.receipt_image_url ? (
                                <Stack direction='row' spacing={1} alignItems='center'>
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
                                        width: 44,
                                        height: 44,
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: imgStatus === 'failed' || imgStatus === 'ocr_error' ? METRIC_BAD : imgStatus === 'passed' ? METRIC_GOOD : BORDER_SUBTLE,
                                        cursor: 'pointer',
                                        transition: 'opacity 150ms',
                                        '&:hover': { opacity: 0.8 },
                                      }}
                                    />
                                  </Box>
                                  <Stack spacing={0.5} alignItems='flex-start'>
                                    {showActions && (
                                      <Chip
                                        label={IMAGE_STATUS_LABELS[imgStatus] ?? imgStatus}
                                        size='small'
                                        sx={{
                                          bgcolor: imageStatusChipSx(imgStatus).bg,
                                          color: imageStatusChipSx(imgStatus).color,
                                          fontSize: 10,
                                          height: 18,
                                          fontWeight: 700,
                                          borderRadius: '6px',
                                        }}
                                      />
                                    )}
                                    {showActions && (
                                      <Stack direction='row' spacing={0.25}>
                                        {imgStatus !== 'passed' && (
                                          <IconButton
                                            size='small'
                                            color='success'
                                            disabled={pendingTicket === e.id}
                                            title='Approve entry'
                                            onClick={() => decide(e.id, 'approve')}
                                            sx={{ p: 0.25 }}
                                          >
                                            <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                                          </IconButton>
                                        )}
                                        {imgStatus !== 'failed' && (
                                          <IconButton
                                            size='small'
                                            color='error'
                                            disabled={pendingTicket === e.id}
                                            title='Reject entry'
                                            onClick={() => decide(e.id, 'reject')}
                                            sx={{ p: 0.25 }}
                                          >
                                            <CancelOutlinedIcon sx={{ fontSize: 18 }} />
                                          </IconButton>
                                        )}
                                      </Stack>
                                    )}
                                  </Stack>
                                </Stack>
                              ) : (
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                  No photo
                                </Typography>
                              )}
                            </TableCell>
                            {/* Risk */}
                            <TableCell sx={{ maxWidth: 170 }}>
                              <Stack spacing={0.5} alignItems='flex-start'>
                                {e.risk_score_delta !== 0 && (
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
                                )}
                                {Array.isArray(e.risk_flags) && e.risk_flags.map((flag) => (
                                  <Chip
                                    key={flag}
                                    label={RISK_FLAG_LABELS[flag] ?? flag}
                                    size='small'
                                    sx={{
                                      fontSize: 10,
                                      height: 20,
                                      fontWeight: 700,
                                      bgcolor: METRIC_WARN_TINT,
                                      color: WARN_CHIP_TEXT,
                                      borderRadius: '6px',
                                    }}
                                  />
                                ))}
                                {e.risk_score_delta === 0 && (!e.risk_flags || e.risk_flags.length === 0) && (
                                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>-</Typography>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </AdminCard>
            )}

            {/* Pagination */}
            {total > 0 && (
              <Stack direction='row' alignItems='center' justifyContent='space-between' mt={2}>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                  Showing {rangeStart}-{rangeEnd} of {total}
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    sx={{ textTransform: 'none', borderRadius: '10px' }}
                  >
                    Previous
                  </Button>
                  <Typography variant='caption' sx={{ color: TEXT_SECONDARY, fontWeight: 700 }}>
                    {page} / {pageCount}
                  </Typography>
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={page >= pageCount || isFetching}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    sx={{ textTransform: 'none', borderRadius: '10px' }}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </motion.div>
      </Stack>
    </motion.div>
  );
};

export default EntriesTab;
