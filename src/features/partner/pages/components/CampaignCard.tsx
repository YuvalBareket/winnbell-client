import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Paper, Box, Typography, Stack, Chip, IconButton, TextField, Button,
  CircularProgress, Divider, InputAdornment, Dialog, DialogContent,
} from '@mui/material';
import {
  ReceiptLong, Edit, ChevronRight, Check, Close, TuneOutlined,
  AttachMoneyOutlined, ImageOutlined, VisibilityOutlined,
  UndoOutlined, DeleteOutlineOutlined, CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessData } from '../../types/business.types';
import { PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10 } from '../../../../shared/colors';
import { getUploadUrl } from '../../api/business.api';

// ────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  business: BusinessData;
  updateCampaignSettings?: (data: { min_transaction_amount: number | null; receipt_example_image_url?: string | null }) => void;
  isUpdatingSettings?: boolean;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

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

  // ── Receipt example state ────────────────────────────
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);

  // Canvas / drawing state (all in refs to avoid stale closures)
  const [imgFile, setImgFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);
  const [pathCount, setPathCount] = useState(0);

  // ── Threshold handlers ────────────────────────────────
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
    updateCampaignSettings?.({ min_transaction_amount: parsed });
    setEditingThreshold(false);
  };

  // ── Receipt edit handlers ─────────────────────────────
  const openReceiptEdit = () => {
    setImgFile(null);
    pathsRef.current = [];
    currentPathRef.current = [];
    setPathCount(0);
    setEditingReceipt(true);
  };

  const cancelReceiptEdit = () => {
    setEditingReceipt(false);
    setImgFile(null);
    pathsRef.current = [];
    setPathCount(0);
  };

  // ── Canvas drawing ────────────────────────────────────
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const drawPath = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };
    pathsRef.current.forEach(drawPath);
    if (currentPathRef.current.length > 1) drawPath(currentPathRef.current);
  };

  useEffect(() => {
    if (!imgFile) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const containerW = canvasContainerRef.current?.clientWidth || 400;
      const maxH = 320;
      const scale = Math.min(containerW / img.width, maxH / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      pathsRef.current = [];
      currentPathRef.current = [];
      setPathCount(0);
      redrawCanvas();
    };
    img.src = URL.createObjectURL(imgFile);
  }, [imgFile]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const client = 'touches' in e ? e.touches[0] : e;
    return { x: (client.clientX - rect.left) * scaleX, y: (client.clientY - rect.top) * scaleY };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imgFile) return;
    isDrawingRef.current = true;
    currentPathRef.current = [getCanvasPos(e)];
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if ('touches' in e) e.preventDefault();
    currentPathRef.current = [...currentPathRef.current, getCanvasPos(e)];
    redrawCanvas();
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current.length > 1) {
      pathsRef.current = [...pathsRef.current, currentPathRef.current];
      setPathCount(pathsRef.current.length);
    }
    currentPathRef.current = [];
    redrawCanvas();
  };

  const handleUndo = () => {
    pathsRef.current = pathsRef.current.slice(0, -1);
    setPathCount(pathsRef.current.length);
    redrawCanvas();
  };

  const handleClearAll = () => {
    pathsRef.current = [];
    currentPathRef.current = [];
    setPathCount(0);
    redrawCanvas();
  };

  const handleSaveReceipt = async () => {
    if (!canvasRef.current || !imgFile) return;
    setIsSavingReceipt(true);
    try {
      const blob = await new Promise<Blob>((res) =>
        canvasRef.current!.toBlob((b) => res(b!), 'image/jpeg', 0.92),
      );
      const { uploadUrl, publicUrl } = await getUploadUrl('image/jpeg');
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      updateCampaignSettings?.({
        min_transaction_amount: business.min_transaction_amount,
        receipt_example_image_url: publicUrl,
      });
      setEditingReceipt(false);
      setImgFile(null);
      pathsRef.current = [];
      setPathCount(0);
    } catch (err) {
      console.error('Failed to save receipt example:', err);
    } finally {
      setIsSavingReceipt(false);
    }
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
                      helperText='Customers must spend at least this amount per receipt to earn a ticket entry.'
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
                    width: 36, height: 36, borderRadius: 1.5,
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

            {/* Edit form — canvas annotation */}
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
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files?.[0]) setImgFile(e.target.files[0]); }}
                    />

                    {!imgFile ? (
                      /* Upload zone */
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          border: '2px dashed', borderColor: 'divider', borderRadius: 2.5,
                          minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textAlign: 'center', cursor: 'pointer', mb: 2,
                          transition: 'all 0.18s',
                          '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: `${PRIMARY_MAIN}04` },
                          '&:active': { transform: 'scale(0.99)' },
                        }}
                      >
                        <Stack alignItems='center' spacing={1} sx={{ p: 3 }}>
                          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${PRIMARY_MAIN}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CloudUpload sx={{ fontSize: 26, color: PRIMARY_MAIN }} />
                          </Box>
                          <Typography variant='body2' fontWeight={800} color='text.primary'>
                            Upload a receipt photo
                          </Typography>
                          <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, maxWidth: 240 }}>
                            Then mark the receipt number so customers know exactly where to look
                          </Typography>
                        </Stack>
                      </Box>
                    ) : (
                      <>
                        {/* Instruction */}
                        <Box sx={{ bgcolor: 'rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.9rem', lineHeight: 1, mt: 0.1 }}>✏️</Typography>
                          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.5 }}>
                            Draw over the receipt number with your finger or mouse to highlight it for customers
                          </Typography>
                        </Box>

                        {/* Canvas */}
                        <Box ref={canvasContainerRef} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 1.5, lineHeight: 0 }}>
                          <canvas
                            ref={canvasRef}
                            onMouseDown={handlePointerDown}
                            onMouseMove={handlePointerMove}
                            onMouseUp={handlePointerUp}
                            onMouseLeave={handlePointerUp}
                            onTouchStart={handlePointerDown}
                            onTouchMove={handlePointerMove}
                            onTouchEnd={handlePointerUp}
                            style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
                          />
                        </Box>

                        {/* Undo / Clear / New photo */}
                        <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
                          <Button variant='outlined' size='small' startIcon={<UndoOutlined sx={{ fontSize: 15 }} />} onClick={handleUndo}
                            disabled={pathCount === 0} sx={{ ...btnBase, flex: 1, fontSize: '0.75rem' }}>
                            Undo
                          </Button>
                          <Button variant='outlined' size='small' startIcon={<DeleteOutlineOutlined sx={{ fontSize: 15 }} />} onClick={handleClearAll}
                            disabled={pathCount === 0} sx={{ ...btnBase, flex: 1, fontSize: '0.75rem' }}>
                            Clear
                          </Button>
                          <Button variant='outlined' size='small' onClick={() => { setImgFile(null); pathsRef.current = []; setPathCount(0); }}
                            sx={{ ...btnBase, flex: 1, fontSize: '0.75rem' }}>
                            New photo
                          </Button>
                        </Stack>
                      </>
                    )}

                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <Button size='small' onClick={cancelReceiptEdit} startIcon={<Close sx={{ fontSize: 16 }} />} sx={btnBase}>
                        Cancel
                      </Button>
                      <Button
                        size='small'
                        variant='contained'
                        disabled={isSavingReceipt || !imgFile}
                        onClick={handleSaveReceipt}
                        startIcon={isSavingReceipt ? <CircularProgress size={14} color='inherit' /> : <Check sx={{ fontSize: 16 }} />}
                        sx={{ ...btnBase, fontWeight: 800 }}
                      >
                        Save
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
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
          >
            <Close />
          </IconButton>
          {business.receipt_example_image_url && (
            <Box component='img' src={business.receipt_example_image_url} alt='Receipt example'
              sx={{ display: 'block', width: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 3 }} />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CampaignCard;
