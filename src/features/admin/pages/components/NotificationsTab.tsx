import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { SendOutlined, HistoryOutlined } from '@mui/icons-material';
import { useSendNotification, useNotificationHistory } from '../../hooks/useAdmin';
import {
  PRIMARY_MAIN, ALPHA_PRIMARY_10, ALPHA_PRIMARY_04, BORDER_LIGHT, BORDER_SUBTLE, BG_ROW_SUBTLE,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, PRIMARY_TINT, AMBER_HOURGLASS, ALPHA_AMBER_12,
  GRADIENT_CTA, SHADOW_PRIMARY_SOFT,
} from '../../../../shared/colors';
import { riseIn, staggerContainer } from '../../../../shared/motion';
import { AdminCard, SectionHeader, IconTile } from './adminUi';

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
    <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
      <Stack spacing={3}>
        {/* Compose Card */}
        <motion.div variants={riseIn}>
          <AdminCard>
            <Stack spacing={0}>
              <Box sx={{ p: 2.25 }}>
                <SectionHeader
                  icon={<SendOutlined />}
                  tint={PRIMARY_TINT}
                  color={PRIMARY_MAIN}
                  title='Send Push Notification'
                />
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mb: 2 }}>
                  Compose and send a push notification to your selected audience.
                </Typography>

                {/* Title field */}
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
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT } }}
                />
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, mt: 0.5, display: 'block' }}>
                  {title.length} / 100
                </Typography>

                {/* Body field */}
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
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT } }}
                />
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, mt: 0.5, display: 'block' }}>
                  {body.length} / 500
                </Typography>

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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT } }}
                />

                {/* Audience selector */}
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: TEXT_HEADING, mb: 1 }}>Audience</Typography>
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
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: `1px solid ${selected ? PRIMARY_MAIN : BORDER_LIGHT}`,
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
                            sx={{ fontWeight: selected ? 700 : 500, color: selected ? PRIMARY_MAIN : 'text.primary' }}
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

                <Button
                  variant='contained'
                  disableElevation
                  onClick={handleSendClick}
                  disabled={!isFormValid || sendMutation.isPending}
                  sx={{
                    background: confirming ? undefined : GRADIENT_CTA,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: SHADOW_PRIMARY_SOFT,
                    '&:hover': { boxShadow: SHADOW_PRIMARY_SOFT },
                  }}
                  color={confirming ? 'warning' : 'primary'}
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
          </AdminCard>
        </motion.div>

        {/* History Card */}
        <motion.div variants={riseIn}>
          <AdminCard>
            <Stack spacing={0}>
              <Box sx={{ p: 2.25 }}>
                <SectionHeader
                  icon={<HistoryOutlined />}
                  tint={PRIMARY_TINT}
                  color={PRIMARY_MAIN}
                  title='Notification History'
                />
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
                  Recently sent push notifications.
                </Typography>
              </Box>

              <Box sx={{ borderTop: `1px solid ${BORDER_SUBTLE}` }} />

              {!history || history.length === 0 ? (
                <Box sx={{ p: 2.25, textAlign: 'center' }}>
                  <motion.div variants={riseIn}>
                    <IconTile
                      icon={<HistoryOutlined />}
                      tint={ALPHA_AMBER_12}
                      color={AMBER_HOURGLASS}
                      size={40}
                    />
                    <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mt: 1 }}>
                      No notifications sent yet.
                    </Typography>
                  </motion.div>
                </Box>
              ) : (
                <Stack spacing={0}>
                  {history.map((item, index) => (
                    <motion.div key={item.id} variants={riseIn}>
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: index < history.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                          '&:hover': { bgcolor: BG_ROW_SUBTLE },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant='body2' sx={{ fontWeight: 600, color: TEXT_HEADING }} noWrap>
                                {item.title}
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{
                                  color: TEXT_SECONDARY,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mt: 0.5,
                                }}
                              >
                                {item.body}
                              </Typography>
                            </Box>
                            <Chip
                              label={AUDIENCE_LABELS[item.audience] ?? item.audience}
                              size='small'
                              color={AUDIENCE_COLORS[item.audience] ?? 'default'}
                              variant='outlined'
                              sx={{ ml: 1, flexShrink: 0 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                              Sent: {item.sent_count.toLocaleString()}
                            </Typography>
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                              {new Date(item.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              )}
            </Stack>
          </AdminCard>
        </motion.div>
      </Stack>
    </motion.div>
  );
};

export default NotificationsTab;
