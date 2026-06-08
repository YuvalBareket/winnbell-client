import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useSendNotification, useNotificationHistory } from '../../hooks/useAdmin';
import { PRIMARY_MAIN, ALPHA_PRIMARY_10, ALPHA_PRIMARY_04 } from '../../../../shared/colors';

type Audience = 'all' | 'users' | 'businesses';

const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: 'all', label: 'All Users and Businesses' },
  { value: 'users', label: 'Users Only' },
  { value: 'businesses', label: 'Businesses Only' },
];

const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'All',
  users: 'Users Only',
  businesses: 'Businesses Only',
};

const AUDIENCE_COLORS: Record<Audience, 'default' | 'primary' | 'secondary'> = {
  all: 'primary',
  users: 'secondary',
  businesses: 'default',
};

const NotificationsTab: React.FC = () => {
  const sendMutation = useSendNotification();
  const { data: history } = useNotificationHistory();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [confirming, setConfirming] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    sendMutation.mutate(
      { title, body, url: url.trim() || undefined, audience },
      {
        onSuccess: () => {
          setSendSuccess(true);
          setTitle('');
          setBody('');
          setUrl('');
          setAudience('all');
          setConfirming(false);
        },
        onError: () => {
          setConfirming(false);
        },
      },
    );
  };

  const isFormValid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Stack spacing={3}>
      {/* Compose Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={700} mb={0.5}>Send Push Notification</Typography>
              <Typography variant='body2' color='text.secondary'>
                Compose and send a push notification to your selected audience.
              </Typography>
            </Box>

            <Divider />

            {/* Title field */}
            <Box>
              <TextField
                label='Title'
                required
                fullWidth
                size='small'
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setTitle(e.target.value);
                    setSendSuccess(false);
                    setConfirming(false);
                  }
                }}
                inputProps={{ maxLength: 100 }}
              />
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                {title.length} / 100
              </Typography>
            </Box>

            {/* Body field */}
            <Box>
              <TextField
                label='Body'
                required
                fullWidth
                multiline
                rows={3}
                size='small'
                value={body}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setBody(e.target.value);
                    setSendSuccess(false);
                    setConfirming(false);
                  }
                }}
                inputProps={{ maxLength: 500 }}
              />
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                {body.length} / 500
              </Typography>
            </Box>

            {/* URL field */}
            <TextField
              label='URL (optional)'
              fullWidth
              size='small'
              placeholder='e.g. /tickets'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setSendSuccess(false);
                setConfirming(false);
              }}
            />

            {/* Audience selector */}
            <Box>
              <Typography variant='body2' fontWeight={600} mb={1}>Audience</Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                {AUDIENCE_OPTIONS.map((option) => {
                  const selected = audience === option.value;
                  return (
                    <Box
                      key={option.value}
                      onClick={() => {
                        setAudience(option.value);
                        setSendSuccess(false);
                        setConfirming(false);
                      }}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selected ? PRIMARY_MAIN : 'divider',
                        bgcolor: selected ? ALPHA_PRIMARY_10 : ALPHA_PRIMARY_04,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: PRIMARY_MAIN,
                          bgcolor: ALPHA_PRIMARY_10,
                        },
                      }}
                    >
                      <Typography
                        variant='body2'
                        fontWeight={selected ? 700 : 500}
                        sx={{ color: selected ? PRIMARY_MAIN : 'text.primary' }}
                      >
                        {option.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {sendSuccess && (
              <Alert severity='success' onClose={() => setSendSuccess(false)}>
                Notification sent successfully.
              </Alert>
            )}

            {sendMutation.isError && (
              <Alert severity='error'>
                Failed to send notification. Please try again.
              </Alert>
            )}

            <Box>
              <Button
                variant='contained'
                disableElevation
                onClick={handleSendClick}
                disabled={!isFormValid || sendMutation.isPending}
                color={confirming ? 'warning' : 'primary'}
                sx={{ fontWeight: 700 }}
              >
                {sendMutation.isPending
                  ? <CircularProgress size={20} color='inherit' />
                  : confirming
                  ? 'Confirm Send?'
                  : 'Send Notification'}
              </Button>
              {confirming && (
                <Button
                  variant='text'
                  size='small'
                  onClick={() => setConfirming(false)}
                  sx={{ ml: 1, fontWeight: 600 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* History Card */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant='h6' fontWeight={700} mb={0.5}>Notification History</Typography>
              <Typography variant='body2' color='text.secondary'>
                Recently sent push notifications.
              </Typography>
            </Box>

            <Divider />

            {!history || history.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No notifications sent yet.
              </Typography>
            ) : (
              <Stack spacing={0}>
                {/* Header row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 3fr 1fr 80px 120px',
                    gap: 1,
                    px: 1.5,
                    py: 0.75,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  {['Title', 'Body', 'Audience', 'Sent', 'Date'].map((col) => (
                    <Typography key={col} variant='caption' fontWeight={700} color='text.secondary'>
                      {col}
                    </Typography>
                  ))}
                </Box>

                {history.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 3fr 1fr 80px 120px',
                      gap: 1,
                      px: 1.5,
                      py: 1,
                      alignItems: 'center',
                      borderBottom: index < history.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant='body2' fontWeight={600} noWrap>
                      {item.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.body}
                    </Typography>
                    <Chip
                      label={AUDIENCE_LABELS[item.audience] ?? item.audience}
                      size='small'
                      color={AUDIENCE_COLORS[item.audience] ?? 'default'}
                      variant='outlined'
                    />
                    <Typography variant='body2' color='text.secondary'>
                      {item.sent_count.toLocaleString()}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default NotificationsTab;
