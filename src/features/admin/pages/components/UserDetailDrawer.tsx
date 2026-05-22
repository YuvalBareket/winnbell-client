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
import { useUserDetail } from '../../hooks/useAdmin';

interface Props {
  userId: number | null;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  code: 'Code',
  receipt: 'Receipt',
  free: 'Free',
  promo: 'Promo',
};

const UserDetailDrawer: React.FC<Props> = ({ userId, onClose }) => {
  const { data, isLoading } = useUserDetail(userId);
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
      PaperProps={{ sx: { width: { xs: '100vw', sm: 480 }, p: 0 } }}
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
                            <Chip label='Quarantined' size='small' color='error' />
                          ) : (
                            <Chip label='Active' size='small' color='success' />
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
