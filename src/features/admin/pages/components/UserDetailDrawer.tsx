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
import { motion } from 'framer-motion';
import { useUserDetail, useAdminImageDecision } from '../../hooks/useAdmin';
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

const UserDetailDrawer: React.FC<Props> = ({ userId, onClose }) => {
  const { data, isLoading } = useUserDetail(userId);
  const imageDecision = useAdminImageDecision();
  const [pendingTicket, setPendingTicket] = React.useState<number | null>(null);
  const user = data?.user;
  const entries = data?.entries ?? [];
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
