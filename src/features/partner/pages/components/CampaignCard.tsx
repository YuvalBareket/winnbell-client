import { useState, useMemo } from 'react';
import {
  Paper, Box, Typography, Stack, Chip, IconButton, TextField, Button,
  CircularProgress, Divider, InputAdornment, Dialog, DialogContent, Alert,
} from '@mui/material';
import {
  ReceiptLong, Edit, ChevronRight, Check, Close, TuneOutlined,
  AttachMoneyOutlined, ImageOutlined, VisibilityOutlined, WarningAmberOutlined,
} from '@mui/icons-material';
import CanvasAnnotationEditor from '../../../../shared/components/CanvasAnnotationEditor';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessData } from '../../types/business.types';
import { PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10 } from '../../../../shared/colors';
import { formatCurrency } from '../../../../shared/utils/date';
import { getUploadUrl } from '../../api/business.api';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  business: BusinessData;
  updateCampaignSettings?: (data: { min_transaction_amount?: number; receipt_example_image_url?: string | null }) => void;
  isUpdatingSettings?: boolean;
}

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

  // ── Receipt example state ────────────────────────────
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [imgFile, setImgFile] = useState<File | null>(null);

  // ── Threshold handlers ────────────────────────────────
  const openThresholdEdit = () => {
    const prefill = business.pending_min_transaction_amount ?? business.min_transaction_amount;
    setThresholdValue(prefill != null ? String(prefill) : '');
    setEditingThreshold(true);
  };

  const cancelThresholdEdit = () => {
    setEditingThreshold(false);
    setThresholdValue('');
  };

  const saveThreshold = () => {
    const trimmed = thresholdValue.trim();
    if (trimmed === '') return; // Prevent empty submission
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed) || parsed <= 0) return; // Prevent non-positive submission
    updateCampaignSettings?.({ min_transaction_amount: parsed });
    setEditingThreshold(false);
  };

  // ── Receipt edit handlers ─────────────────────────────
  const openReceiptEdit = () => {
    setImgFile(null);
    setEditingReceipt(true);
  };

  const cancelReceiptEdit = () => {
    setEditingReceipt(false);
    setImgFile(null);
  };

  const handleSaveReceipt = async (blob: Blob) => {
    setIsSavingReceipt(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl('image/jpeg', blob.size);
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      // The receipt example is independent of the threshold, so only send the image.
      updateCampaignSettings?.({ receipt_example_image_url: publicUrl });
      setEditingReceipt(false);
      setImgFile(null);
    } catch (err) {
      console.error('Failed to save receipt example:', err);
    } finally {
      setIsSavingReceipt(false);
    }
  };

  // ── Live preview for threshold ───────────────────────
  const previewThreshold = useMemo(() => {
    const trimmed = thresholdValue.trim();
    if (trimmed === '') return null;
    const val = parseFloat(trimmed);
    if (isNaN(val) || val <= 0) return null;
    return val;
  }, [thresholdValue]);

  const isThresholdValid = thresholdValue.trim() !== '' && previewThreshold !== null;

  const displayThreshold = editingThreshold ? previewThreshold : business.min_transaction_amount;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
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
            label={
              business.subscription_status === 'Past_Due'
                ? 'Past due'
                : business.subscription_status === 'Incomplete'
                ? 'Payment pending'
                : business.subscription_status ?? 'Inactive'
            }
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

      {/* Payment issue banner: the owner's home page must surface a failed charge loudly. */}
      {(business.subscription_status === 'Past_Due' || business.subscription_status === 'Incomplete') && (
        <Alert
          severity='error'
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color='inherit' size='small' onClick={() => navigate('/subscription/manage')} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
              Fix payment
            </Button>
          }
        >
          We could not process your payment. Update your payment method to stay in the next campaign.
        </Alert>
      )}

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
                    width: 36, height: 36, borderRadius: 2,
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
                    <Box>
                      <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600, mt: 0.25 }}>
                        {`${formatCurrency(business.min_transaction_amount)} per entry`}
                      </Typography>
                      {business.pending_min_transaction_amount != null && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.75, px: 1, py: 0.25, borderRadius: 2, bgcolor: 'rgba(237,108,2,0.08)', border: '1px solid rgba(237,108,2,0.2)' }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                          <Typography variant='caption' sx={{ color: 'warning.dark', fontWeight: 700, lineHeight: 1 }}>
                            Changes to {formatCurrency(business.pending_min_transaction_amount)} next campaign
                          </Typography>
                        </Box>
                      )}
                    </Box>
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
                    {business.is_participating && (
                      <Box sx={{ display: 'flex', gap: 1.25, p: 1.5, borderRadius: 2, bgcolor: 'rgba(237,108,2,0.06)', border: '1px solid rgba(237,108,2,0.15)' }}>
                        <WarningAmberOutlined sx={{ fontSize: 18, color: 'warning.main', flexShrink: 0 }} />
                        <Box>
                          <Typography variant='caption' fontWeight={800} sx={{ color: 'warning.dark', display: 'block', mb: 0.25 }}>
                            Campaign is live
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            Your current threshold stays active for this campaign. Any change you save here will take effect when the next campaign begins.
                          </Typography>
                        </Box>
                      </Box>
                    )}
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
                      helperText='Customers must spend at least this amount per receipt to earn an entry.'
                      sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: 'white' },
                        '& .MuiFormHelperText-root': { mx: 0, mt: 0.75, lineHeight: 1.4 },
                      }}
                    />

                    {/* Live preview */}
                    {displayThreshold != null && displayThreshold > 0 && (
                      <Box
                        sx={{
                          px: 2, py: 1.25, borderRadius: 2,
                          bgcolor: 'rgba(2,146,183,0.05)',
                          border: '1px dashed',
                          borderColor: 'rgba(2,146,183,0.2)',
                        }}
                      >
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                          Preview
                        </Typography>
                        <Stack spacing={0.25}>
                          {[displayThreshold - 1, displayThreshold].map((amount) => (
                            <Typography key={amount} variant='body2' sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                              {formatCurrency(amount)} ={' '}
                              <Box component='span' sx={{ fontWeight: 700, color: amount >= displayThreshold ? 'success.main' : 'text.disabled' }}>
                                {amount >= displayThreshold ? '1 entry' : 'no entry'}
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
                        disabled={isUpdatingSettings || !isThresholdValid}
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

        {/* ── Setting 2: Receipt Example ────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut', delay: 0.08 }}
        >
          <Box
            sx={{
              p: 2, borderRadius: 2.5,
              bgcolor: ALPHA_PRIMARY_06,
              border: '1px solid',
              borderColor: editingReceipt ? PRIMARY_MAIN : 'transparent',
              transition: 'border-color 160ms ease-out',
              mb: 1.5,
            }}
          >
            {/* Row header */}
            <Stack direction='row' alignItems='center' justifyContent='space-between'>
              <Stack direction='row' alignItems='center' gap={1.5}>
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 2,
                    bgcolor: ALPHA_PRIMARY_10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ImageOutlined sx={{ fontSize: 20, color: PRIMARY_MAIN }} />
                </Box>
                <Box>
                  <Typography variant='body2' fontWeight={700} sx={{ lineHeight: 1.3 }}>
                    Receipt example
                  </Typography>
                  {!editingReceipt && (
                    <Typography variant='body2' sx={{ color: business.receipt_example_image_url ? 'success.main' : 'text.disabled', fontWeight: 600, mt: 0.25 }}>
                      {business.receipt_example_image_url ? 'Uploaded' : 'Not uploaded'}
                    </Typography>
                  )}
                </Box>
              </Stack>
              {!editingReceipt && (
                <Stack direction='row' gap={0.5} flexShrink={0}>
                  {business.receipt_example_image_url && (
                    <IconButton size='small' onClick={() => setPreviewOpen(true)} sx={{ transition: 'transform 160ms ease-out', '&:active': { transform: 'scale(0.97)' } }}>
                      <VisibilityOutlined fontSize='small' />
                    </IconButton>
                  )}
                  <IconButton size='small' onClick={openReceiptEdit} sx={{ transition: 'transform 160ms ease-out', '&:active': { transform: 'scale(0.97)' } }}>
                    <Edit fontSize='small' />
                  </IconButton>
                </Stack>
              )}
            </Stack>

            {/* Edit form - canvas annotation */}
            <AnimatePresence mode='wait'>
              {editingReceipt && (
                <MotionBox
                  key='receipt-edit'
                  variants={editFormVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                >
                  <Box sx={{ mt: 2 }}>
                    <CanvasAnnotationEditor
                      imgFile={imgFile}
                      onFileSelect={(file) => setImgFile(file)}
                      onSave={handleSaveReceipt}
                      isSaving={isSavingReceipt}
                    />

                    <Stack direction='row' spacing={1} justifyContent='flex-end' sx={{ mt: 1 }}>
                      <Button size='small' onClick={cancelReceiptEdit} startIcon={<Close sx={{ fontSize: 16 }} />} sx={btnBase}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </MotionBox>

      </Stack>

      {/* ── Receipt preview dialog ────────────────────── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
          >
            <Close />
          </IconButton>
          {business.receipt_example_image_url && (
            <Box component='img' src={business.receipt_example_image_url} alt='Receipt example'
              sx={{ display: 'block', width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 2 }} />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CampaignCard;
