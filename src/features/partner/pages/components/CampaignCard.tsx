import { useState, useMemo } from 'react';
import {
  Paper, Box, Typography, Stack, Chip, IconButton, TextField, Button,
  CircularProgress, Divider, InputAdornment,
} from '@mui/material';
import {
  ReceiptLong, Edit, ChevronRight, Check, Close, TuneOutlined,
  AttachMoneyOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessData } from '../../types/business.types';
import { PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10 } from '../../../../shared/colors';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  business: BusinessData;
  updateCampaignSettings?: (data: { min_transaction_amount: number | null }) => void;
  isUpdatingSettings?: boolean;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const computeEntries = (amount: number, threshold: number): number => {
  if (threshold <= 0) return 0;
  return Math.floor(amount / threshold);
};

const formatCurrency = (v: number): string => `$${v}`;

// ────────────────────────────────────────────────────────────
// Animation wrappers
// ────────────────────────────────────────────────────────────

const MotionBox = motion.create(Box);

const editFormVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' as const },
  visible: { opacity: 1, height: 'auto', overflow: 'visible' as const, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit: { opacity: 0, height: 0, overflow: 'hidden' as const, transition: { duration: 0.16, ease: 'easeIn' as const } },
};

// ────────────────────────────────────────────────────────────
// Button sx presets (consistent with design system)
// ────────────────────────────────────────────────────────────

const btnBase = {
  borderRadius: 2,
  fontWeight: 700,
  textTransform: 'none' as const,
  transition: 'transform 160ms ease-out, background-color 160ms ease-out',
  '&:active': { transform: 'scale(0.97)' },
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

const CampaignCard = ({
  business,
  updateCampaignSettings,
  isUpdatingSettings = false,
}: CampaignCardProps) => {
  const navigate = useNavigate();

  // ── Threshold editing state ──────────────────────────
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdValue, setThresholdValue] = useState('');

  // ── Handlers ─────────────────────────────────────────
  const openThresholdEdit = () => {
    setThresholdValue(business.min_transaction_amount != null ? String(business.min_transaction_amount) : '');
    setEditingThreshold(true);
  };

  const cancelThresholdEdit = () => {
    setEditingThreshold(false);
    setThresholdValue('');
  };

  const saveThreshold = () => {
    const parsed = thresholdValue.trim() === '' ? null : parseFloat(thresholdValue);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) return;
    updateCampaignSettings?.({
      min_transaction_amount: parsed,
    });
    setEditingThreshold(false);
  };

  // ── Live preview for threshold ───────────────────────
  const previewThreshold = useMemo(() => {
    const val = thresholdValue.trim() === '' ? null : parseFloat(thresholdValue);
    if (val == null || isNaN(val) || val <= 0) return null;
    return val;
  }, [thresholdValue]);

  const displayThreshold = editingThreshold ? previewThreshold : business.min_transaction_amount;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* ── Plan row ──────────────────────────────────── */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1.5} mb={2}>
        <Stack direction='row' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2,
              bgcolor: business.subscription_status === 'Active' ? 'primary.main' : 'action.disabledBackground',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <ReceiptLong sx={{ color: business.subscription_status === 'Active' ? 'white' : 'text.disabled', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Campaign
            </Typography>
            <Typography variant='body1' fontWeight={700}>
              {business.subscription_status ? 'Winnbell Partner Plan' : 'No active plan'}
            </Typography>
            {business.current_period_end && (
              <Typography variant='caption' color='text.secondary'>
                {business.cancel_at_period_end
                  ? `Cancels on ${new Date(business.current_period_end).toLocaleDateString()}`
                  : `Renews ${new Date(business.current_period_end).toLocaleDateString()}`}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Chip
            label={business.subscription_status ?? 'Inactive'}
            size='small'
            sx={{
              fontWeight: 700,
              bgcolor: business.subscription_status === 'Active'
                ? 'rgba(46,125,50,0.1)'
                : business.subscription_status === 'Past_Due'
                ? 'rgba(237,108,2,0.1)'
                : 'action.hover',
              color: business.subscription_status === 'Active'
                ? 'success.main'
                : business.subscription_status === 'Past_Due'
                ? 'warning.main'
                : 'text.secondary',
            }}
          />
          {business.subscription_status && (
            <IconButton size='small' onClick={() => navigate('/subscription/manage')}>
              <ChevronRight fontSize='small' />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack direction='row' alignItems='center' gap={1} mb={2}>
        <TuneOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Campaign Rules
        </Typography>
      </Stack>

      <Stack spacing={0}>
        {/* ── Setting 1: Spending Threshold ──────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut', delay: 0 }}
        >
          <Box
            sx={{
              p: 2, borderRadius: 2.5,
              bgcolor: ALPHA_PRIMARY_06,
              border: '1px solid',
              borderColor: editingThreshold ? PRIMARY_MAIN : 'transparent',
              transition: 'border-color 160ms ease-out',
              mb: 1.5,
            }}
          >
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Stack direction='row' alignItems='center' gap={1.5}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: ALPHA_PRIMARY_10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AttachMoneyOutlined sx={{ fontSize: 20, color: PRIMARY_MAIN }} />
                </Box>
                <Box>
                  <Typography variant='body2' fontWeight={700} sx={{ lineHeight: 1.3 }}>
                    Spending threshold
                  </Typography>
                  {!editingThreshold && (
                    <Typography variant='body2' sx={{ color: business.min_transaction_amount != null ? 'text.primary' : 'text.disabled', fontWeight: 600, mt: 0.25 }}>
                      {business.min_transaction_amount != null
                        ? `${formatCurrency(business.min_transaction_amount)} per entry`
                        : 'No minimum'}
                    </Typography>
                  )}
                </Box>
              </Stack>
              {!editingThreshold && (
                <IconButton size='small' onClick={openThresholdEdit} sx={{ transition: 'transform 160ms ease-out', '&:active': { transform: 'scale(0.97)' } }}>
                  <Edit fontSize='small' />
                </IconButton>
              )}
            </Stack>

            <AnimatePresence mode='wait'>
              {editingThreshold && (
                <MotionBox
                  key='threshold-edit'
                  variants={editFormVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                >
                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    <TextField
                      value={thresholdValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d*\.?\d*$/.test(v)) setThresholdValue(v);
                      }}
                      placeholder='e.g. 50'
                      size='small'
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.95rem' }}>$</Typography>
                          </InputAdornment>
                        ),
                      }}
                      helperText='Customers must spend at least this amount per receipt to earn entries. $110 with a $50 threshold = 2 entries.'
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' },
                        '& .MuiFormHelperText-root': { mx: 0, mt: 0.75, lineHeight: 1.4 },
                      }}
                    />

                    {/* Live preview */}
                    {displayThreshold != null && displayThreshold > 0 && (
                      <Box
                        sx={{
                          px: 2, py: 1.25, borderRadius: 1.5,
                          bgcolor: 'rgba(25,93,230,0.05)',
                          border: '1px dashed',
                          borderColor: 'rgba(25,93,230,0.2)',
                        }}
                      >
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                          Preview
                        </Typography>
                        <Stack spacing={0.25}>
                          {[
                            displayThreshold - 1,
                            displayThreshold,
                            displayThreshold * 2 + Math.round(displayThreshold * 0.2),
                          ].map((amount) => (
                            <Typography key={amount} variant='body2' sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              {formatCurrency(amount)} ={' '}
                              <Box component='span' sx={{ fontWeight: 700, color: computeEntries(amount, displayThreshold) > 0 ? 'success.main' : 'text.disabled' }}>
                                {computeEntries(amount, displayThreshold)} {computeEntries(amount, displayThreshold) === 1 ? 'entry' : 'entries'}
                              </Box>
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <Button size='small' onClick={cancelThresholdEdit} startIcon={<Close sx={{ fontSize: 16 }} />} sx={btnBase}>
                        Cancel
                      </Button>
                      <Button
                        size='small'
                        variant='contained'
                        disabled={isUpdatingSettings}
                        onClick={saveThreshold}
                        startIcon={isUpdatingSettings ? <CircularProgress size={14} color='inherit' /> : <Check sx={{ fontSize: 16 }} />}
                        sx={{ ...btnBase, fontWeight: 800 }}
                      >
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </MotionBox>

      </Stack>
    </Paper>
  );
};

export default CampaignCard;
