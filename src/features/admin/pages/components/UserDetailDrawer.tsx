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
import { useUserDetail, useAdminImageDecision } from '../../hooks/useAdmin';

interface Props {
  userId: number | null;
  onClose: () => void;
}

// 'code' stays only to label legacy tickets from the removed code entry mode.
const SOURCE_LABELS: Record<string, string> = {
  code: 'Code',
  receipt: 'Receipt',
  free: 'Free',
  promo: 'Promo',
  referral: 'Referral',
};

const QUARANTINE_LABELS: Record<string, string> = {
  high_risk_user: 'High risk user',
  ocr_pending: 'Image pending review',
  ocr_validation_failed: 'Image rejected',
  ocr_error_pending_review: 'OCR error — pending review',
  shared_receipt_suspected: 'Shared receipt',
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
};

const UserDetailDrawer: React.FC<Props> = ({ userId, onClose }) => {
  const { data, isLoading } = useUserDetail(userId);
  const imageDecision = useAdminImageDecision();
  const [pendingTicket, setPendingTicket] = React.useState<number | null>(null);
  const user = data?.user;
  const entries = data?.entries ?? [];

  const riskColor: 'error' | 'warning' | 'success' =
    (user?.risk_score ?? 0) >= 20 ? 'error' : (user?.risk_score ?? 0) >= 10 ? 'warning' : 'success';
  const riskLabel =
    (user?.risk_score ?? 0) >= 20 ? 'HIGH' : (user?.risk_score ?? 0) >= 10 ? 'MEDIUM' : 'LOW';
  const RiskIcon =
    (user?.risk_score ?? 0) >= 20 ? GppBadIcon : (user?.risk_score ?? 0) >= 10 ? WarningIcon : VerifiedUserIcon;

  return (
    <Drawer
      anchor='right'
      open={userId !== null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 600, md: 900, lg: 1000 }, p: 0 } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant='h6' fontWeight={700}>User Profile</Typography>
        <IconButton onClick={onClose} size='small'><CloseIcon /></IconButton>
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
          <Stack spacing={3}>
            {/* Identity */}
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 700 }}>
                {(user.full_name ?? user.email ?? '?')[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant='h6' fontWeight={700} lineHeight={1.2}>{user.full_name ?? '—'}</Typography>
                <Typography variant='body2' color='text.secondary'>{user.email}</Typography>
              </Box>
            </Stack>

            {/* Status chips */}
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              <Chip label={user.role} size='small' color={user.role === 'Business' ? 'secondary' : 'default'} />
              <Chip label={user.is_active ? 'Active' : 'Inactive'} size='small' color={user.is_active ? 'success' : 'default'} variant={user.is_active ? 'filled' : 'outlined'} />
              <Chip label={user.is_email_verified ? 'Email Verified' : 'Unverified'} size='small' color={user.is_email_verified ? 'success' : 'warning'} variant='outlined' />
              <Chip icon={<RiskIcon />} label={`${riskLabel} · ${user.risk_score}`} size='small' color={riskColor} />
            </Stack>

            {/* Stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {[
                { label: 'Member Since', value: new Date(user.created_at).toLocaleDateString() },
                { label: 'Total Entries', value: entries.length },
                { label: 'Business', value: user.business_name ?? '—' },
                { label: 'Last Flagged', value: user.risk_last_flagged_at ? new Date(user.risk_last_flagged_at).toLocaleDateString() : 'Never' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant='caption' color='text.secondary' display='block'>{label}</Typography>
                  <Typography variant='body2' fontWeight={600}>{String(value)}</Typography>
                </Box>
              ))}
            </Box>

            {/* Accumulated risk flags */}
            {Array.isArray(user.risk_flags) && user.risk_flags.length > 0 && (
              <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'warning.light', bgcolor: 'warning.50' }}>
                <Typography variant='caption' color='text.secondary' display='block' mb={1}>
                  Risk Signals (accumulated)
                </Typography>
                <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
                  {(user.risk_flags as string[]).map((flag) => (
                    <Chip
                      key={flag}
                      label={RISK_FLAG_LABELS[flag] ?? flag}
                      size='small'
                      color='warning'
                      sx={{ fontSize: 11 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Entry history */}
            <Box>
              <Stack direction='row' alignItems='center' spacing={1} mb={1.5}>
                <ConfirmationNumberOutlinedIcon fontSize='small' color='action' />
                <Typography variant='subtitle2' fontWeight={700}>
                  Entry History ({entries.length})
                </Typography>
              </Stack>

              {entries.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>No entries yet.</Typography>
              ) : (
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Campaign</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Receipt</TableCell>
                      <TableCell>Risk +</TableCell>
                      <TableCell>Risk Signals</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entries.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>
                          <Typography variant='caption' fontWeight={600} noWrap>{e.draw_name ?? '—'}</Typography>
                          {e.business_name && (
                            <Typography variant='caption' color='text.secondary' display='block' noWrap>{e.business_name}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={SOURCE_LABELS[e.entry_source] ?? e.entry_source} size='small' variant='outlined' sx={{ fontSize: 11 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>{e.activated_at ? new Date(e.activated_at).toLocaleDateString() : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {e.is_quarantined ? (
                            <Chip
                              label={QUARANTINE_LABELS[e.quarantine_reason ?? ''] ?? 'Quarantined'}
                              size='small'
                              color={e.quarantine_reason === 'ocr_pending' ? 'warning' : 'error'}
                            />
                          ) : (
                            <Chip label='Active' size='small' color='success' />
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
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: e.image_validation_status === 'failed' || e.image_validation_status === 'ocr_error' ? 'error.main' : e.image_validation_status === 'passed' ? 'success.main' : 'divider',
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
                                  color={
                                    e.image_validation_status === 'passed' ? 'success' :
                                    e.image_validation_status === 'failed' ? 'error' :
                                    e.image_validation_status === 'ocr_error' ? 'warning' :
                                    'default'
                                  }
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
                        <TableCell>
                          {Array.isArray(e.risk_flags) && e.risk_flags.length > 0 ? (
                            <Stack spacing={0.5}>
                              {(e.risk_flags as string[]).map((flag) => (
                                <Chip
                                  key={flag}
                                  label={RISK_FLAG_LABELS[flag] ?? flag}
                                  size='small'
                                  color='warning'
                                  variant='outlined'
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant='caption' color='text.disabled'>—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography color='text.secondary'>User not found.</Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default UserDetailDrawer;
