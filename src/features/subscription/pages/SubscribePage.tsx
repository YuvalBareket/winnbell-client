import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Typography, Paper, Stack, CircularProgress,
  Divider, Skeleton, IconButton, TextField, InputAdornment,
} from '@mui/material';
import {
  ConfirmationNumber, EmojiEvents, Storefront, CreditCard, Groups, Remove, Add,
  CloudUpload, UndoOutlined, DeleteOutlineOutlined, Check, ArrowBack, Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../shared/api/client';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { getUploadUrl, updateCampaignSettingsApi } from '../../partner/api/business.api';

const FEATURES = [
  { icon: <ConfirmationNumber />, text: 'Issue unlimited tickets to your customers' },
  { icon: <EmojiEvents />,        text: 'Enter the next monthly prize draw and grow your prize pool' },
  { icon: <Storefront />,         text: 'Appear on the Winnbell map so customers can find you' },
  { icon: <Groups />,             text: 'Assign branch managers to run your locations' },
];

const TIER_MAP: Record<number, number> = {
  250:  250,
  500:  490,
  750:  730,
  1000: 920,
  1250: 1140,
  1500: 1360,
  1750: 1500,
  2000: 1710,
  2250: 1910,
  2500: 2050,
  2750: 2250,
  3000: 2460,
};

const TIER_KEYS = Object.keys(TIER_MAP).map(Number).sort((a, b) => a - b);
const MAX_TIER = TIER_KEYS[TIER_KEYS.length - 1];

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Threshold' },
  { num: 2, label: 'Guide Image' },
  { num: 3, label: 'Plan' },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <Stack direction='row' alignItems='center' sx={{ mb: 4 }}>
    {STEPS.map((s, idx) => (
      <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Box
            sx={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
              bgcolor: s.num <= currentStep ? 'primary.main' : 'action.hover',
              color: s.num <= currentStep ? 'white' : 'text.disabled',
              transition: 'background-color 0.2s',
            }}
          >
            {s.num < currentStep ? <Check sx={{ fontSize: 13 }} /> : s.num}
          </Box>
          <Typography
            variant='caption'
            sx={{
              fontWeight: 700,
              color: s.num === currentStep ? 'text.primary' : 'text.disabled',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </Typography>
        </Stack>
        {idx < STEPS.length - 1 && (
          <Box sx={{ flex: 1, height: 1, mx: 1.5, bgcolor: s.num < currentStep ? 'primary.main' : 'divider', transition: 'background-color 0.2s' }} />
        )}
      </Box>
    ))}
  </Stack>
);

// ── Step headers ──────────────────────────────────────────────────────────────

const STEP_COPY = [
  {
    headline: 'Start your campaign',
    sub: 'Choose how customers earn their ticket — set a spending goal or let every purchase count.',
  },
  {
    headline: 'Make it crystal clear',
    sub: 'Upload a receipt from your store and mark exactly where customers find the number they need to enter.',
  },
  {
    headline: 'Pick your plan',
    sub: 'Choose the entry volume that fits your traffic. You can scale up anytime.',
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────

const SubscribePage = () => {
  const navigate = useNavigate();
  const { data: businessData } = useBusinessData();
  const locationCount = businessData?.locations?.length ?? null;

  const [step, setStep] = useState(1);
  const [savedThreshold, setSavedThreshold] = useState<number | null>(null);

  // ── STEP 1 ─────────────────────────────────────────────────────────────────
  const [thresholdInput, setThresholdInput] = useState('');
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    if (businessData?.min_transaction_amount != null) {
      setThresholdInput(String(businessData.min_transaction_amount));
      setSavedThreshold(businessData.min_transaction_amount);
    }
  }, [businessData?.min_transaction_amount]);

  const parsedThreshold = thresholdInput.trim() === '' ? null : parseFloat(thresholdInput);
  const isThresholdValid = thresholdInput.trim() === '' || (!isNaN(parsedThreshold!) && parsedThreshold! > 0);

  const handleThresholdContinue = async () => {
    if (!isThresholdValid) return;
    setSavingThreshold(true);
    try {
      await updateCampaignSettingsApi({ min_transaction_amount: parsedThreshold });
      setSavedThreshold(parsedThreshold);
      setStep(2);
    } catch (err) {
      console.error('Failed to save threshold:', err);
    } finally {
      setSavingThreshold(false);
    }
  };

  // ── STEP 2 — canvas marker ─────────────────────────────────────────────────
  const [imgFile, setImgFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use refs for drawing state to avoid stale closures in pointer handlers
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const isDrawingRef = useRef(false);
  const [pathCount, setPathCount] = useState(0); // drives undo button disabled state
  const [isSavingExample, setIsSavingExample] = useState(false);

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

  // Load image onto canvas with correct aspect ratio
  useEffect(() => {
    if (!imgFile) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const containerW = canvasContainerRef.current?.clientWidth || 480;
      const maxH = 380;
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
    const rect = canvasRef.current!.getBoundingClientRect();
    // Scale from display size to canvas pixel size
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const client = 'touches' in e ? e.touches[0] : e;
    return {
      x: (client.clientX - rect.left) * scaleX,
      y: (client.clientY - rect.top) * scaleY,
    };
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

  const handleSaveExample = async () => {
    if (!canvasRef.current || !imgFile) return;
    setIsSavingExample(true);
    try {
      const blob = await new Promise<Blob>((res) =>
        canvasRef.current!.toBlob((b) => res(b!), 'image/jpeg', 0.92),
      );
      const { uploadUrl, publicUrl } = await getUploadUrl('image/jpeg');
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
      await updateCampaignSettingsApi({ min_transaction_amount: savedThreshold, receipt_example_image_url: publicUrl });
      setImgFile(null);
      pathsRef.current = [];
      setPathCount(0);
      setStep(3);
    } catch (err) {
      console.error('Failed to save receipt example:', err);
    } finally {
      setIsSavingExample(false);
    }
  };

  // ── STEP 3 ─────────────────────────────────────────────────────────────────
  const [selectedTier, setSelectedTier] = useState(500);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pricePerLocation = TIER_MAP[selectedTier] ?? 0;
  const effectiveLocationCount = locationCount || 1;
  const yearlyPricePerLocation = pricePerLocation * 12;
  const totalMonthly = pricePerLocation * effectiveLocationCount;
  const totalYearly = yearlyPricePerLocation * effectiveLocationCount;
  const currentIndex = TIER_KEYS.indexOf(selectedTier);
  const atMin = currentIndex === 0;
  const atMax = currentIndex === TIER_KEYS.length - 1;

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<{ url: string }>('/business/subscription/checkout', {
        entries_per_location: selectedTier,
        billing_interval: billingInterval,
      });
      window.location.href = data.url;
    } catch (err: any) {
      const msg = err.response?.data?.error ?? '';
      setError(
        msg.includes('already has an active subscription')
          ? 'Your business already has an active subscription. Go to the subscription page to manage it.'
          : 'Something went wrong. Please try again.',
      );
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const copy = STEP_COPY[step - 1];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        '& > *': { minHeight: { md: '100vh' }, alignItems: 'stretch' },
      }}
    >
      {/* ── Left brand panel ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          background: GRADIENT_HERO,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 4, md: '5vh 6vw' },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 300, md: '100vh' },
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(70px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ConfirmationNumber sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
        </Stack>

        <Box sx={{ my: { xs: 3, md: 0 } }}>
          <Typography variant='h2' fontWeight={900} lineHeight={1.1} mb={2} sx={{ fontSize: { xs: '2.2rem', md: '3rem', lg: '3.5rem' } }}>
            Grow Your<br />Business
          </Typography>
          <Typography variant='body1' sx={{ opacity: 0.85, lineHeight: 1.8, maxWidth: 380, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            One flat monthly fee. Get listed on the map, issue tickets to your customers, and compete in the monthly prize draw.
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {FEATURES.map((f, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={2}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {f.icon}
              </Box>
              <Typography variant='body2' fontWeight={600} sx={{ opacity: 0.9, lineHeight: 1.5 }}>
                {f.text}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography variant='caption' sx={{ opacity: 0.5, display: { xs: 'none', md: 'block' } }}>
          Trusted by businesses across the city
        </Typography>
      </Box>

      {/* ── Right wizard panel ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 3, sm: 4, md: '4vh 4vw' },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 520, md: 560 } }}>
          <Paper elevation={0} sx={{ borderRadius: { xs: 4, md: 5 }, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>

            {/* Step indicator */}
            <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 0 }}>
              <StepIndicator currentStep={step} />
            </Box>

            {/* Header — animated per step */}
            <AnimatePresence mode='wait'>
              <motion.div
                key={`header-${step}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
              >
                <Box
                  sx={{
                    px: { xs: 3, md: 4 },
                    pb: 3,
                    background: 'linear-gradient(135deg, rgba(25,93,230,0.04) 0%, rgba(127,166,255,0.06) 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction='row' alignItems='center' spacing={1} mb={0.75}>
                    {step > 1 && (
                      <IconButton size='small' onClick={() => setStep(step - 1)} sx={{ p: 0.5, color: 'text.secondary', '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}>
                        <ArrowBack sx={{ fontSize: 22 }} />
                      </IconButton>
                    )}
                    <Typography variant='h4' fontWeight={900} color='text.primary' lineHeight={1.15}>
                      {copy.headline}
                    </Typography>
                  </Stack>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                    {copy.sub}
                  </Typography>
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* Step body — animated per step */}
            <AnimatePresence mode='wait'>

              {/* ── Step 1 ── */}
              {step === 1 && (
                <motion.div key='step-1' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                  <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

                    <TextField
                      fullWidth
                      type='text'
                      label='Minimum spend per receipt'
                      placeholder='e.g. 50'
                      value={thresholdInput}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d*\.?\d*$/.test(v)) setThresholdInput(v);
                      }}
                      error={thresholdInput !== '' && !isThresholdValid}
                      helperText={
                        thresholdInput !== '' && !isThresholdValid
                          ? 'Must be a positive number'
                          : 'Leave blank to accept any purchase amount'
                      }
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '1rem' }}>$</Typography></InputAdornment>,
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
                        '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'primary.main' },
                      }}
                    />

                    {/* Live preview */}
                    <Box sx={{ bgcolor: 'rgba(25,93,230,0.04)', borderRadius: 2, p: 2.5, mb: 3, border: '1px dashed', borderColor: 'rgba(25,93,230,0.18)' }}>
                      <Typography variant='caption' fontWeight={800} color='primary.main' display='block' mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                        Preview
                      </Typography>
                      {parsedThreshold && parsedThreshold > 0 ? (
                        <Stack spacing={0.75}>
                          {[parsedThreshold - 1, parsedThreshold, parsedThreshold + parsedThreshold * 0.5].map((amt) => {
                            const earns = amt >= parsedThreshold;
                            return (
                              <Stack key={amt} direction='row' alignItems='center' spacing={1}>
                                <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 80 }}>
                                  ${amt.toFixed(2)}
                                </Typography>
                                <Typography variant='body2' fontWeight={700} sx={{ color: earns ? 'success.main' : 'text.disabled' }}>
                                  {earns ? '✓ 1 entry' : '✗ no entry'}
                                </Typography>
                              </Stack>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          {thresholdInput === '' ? 'Any purchase amount earns 1 entry' : 'Enter an amount above to preview'}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      fullWidth variant='contained' size='large'
                      onClick={handleThresholdContinue}
                      disabled={!isThresholdValid || savingThreshold}
                      sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 14px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.4)' } }}
                    >
                      {savingThreshold ? <CircularProgress size={22} color='inherit' /> : 'Continue →'}
                    </Button>

                    <Button fullWidth variant='text' size='small' onClick={() => navigate('/nearby')} sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
                      I'll do it later
                    </Button>
                  </Box>
                </motion.div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <motion.div key='step-2' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                  <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

                    {!imgFile && businessData?.receipt_example_image_url ? (
                      <>
                        {/* Already uploaded — show preview */}
                        <Box sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, lineHeight: 0 }}>
                          <Box component='img' src={businessData.receipt_example_image_url} alt='Current receipt example'
                            sx={{ display: 'block', width: '100%', maxHeight: 320, objectFit: 'contain' }} />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 2, p: 1.5, mb: 2.5 }}>
                          <Check sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
                          <Typography variant='body2' fontWeight={600} color='success.main'>
                            Receipt example already uploaded
                          </Typography>
                        </Box>

                        <Button fullWidth variant='contained' size='large' onClick={() => setStep(3)}
                          sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', mb: 1.5, boxShadow: '0 4px 14px rgba(25,93,230,0.3)' }}>
                          Looks good, continue →
                        </Button>

                        <input ref={fileInputRef} type='file' accept='image/*' hidden
                          onChange={(e) => { if (e.target.files?.[0]) setImgFile(e.target.files[0]); }} />

                        <Button fullWidth variant='outlined' size='small' startIcon={<Edit />} onClick={() => fileInputRef.current?.click()}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                          Replace image
                        </Button>
                      </>
                    ) : !imgFile ? (
                      <>
                        {/* Upload zone */}
                        <Box
                          onClick={() => fileInputRef.current?.click()}
                          sx={{
                            border: '2px dashed', borderColor: 'divider', borderRadius: 3,
                            minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', cursor: 'pointer', mb: 3,
                            transition: 'all 0.18s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(25,93,230,0.03)' },
                            '&:active': { transform: 'scale(0.99)' },
                          }}
                        >
                          <Stack alignItems='center' spacing={1.5} sx={{ p: 4 }}>
                            <Box sx={{ width: 56, height: 56, borderRadius: 2.5, bgcolor: 'rgba(25,93,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CloudUpload sx={{ fontSize: 28, color: 'primary.main' }} />
                            </Box>
                            <Typography variant='body1' fontWeight={800} color='text.primary'>
                              Upload a receipt photo
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5, maxWidth: 280 }}>
                              Take a photo of any receipt from your store — then you'll mark where the receipt number is
                            </Typography>
                          </Stack>
                        </Box>

                        <input ref={fileInputRef} type='file' accept='image/*' hidden
                          onChange={(e) => { if (e.target.files?.[0]) setImgFile(e.target.files[0]); }} />

                        <Button fullWidth variant='text' onClick={() => setStep(3)}
                          sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
                          Skip for now
                        </Button>
                      </>
                    ) : (
                      <>
                        {/* Instruction */}
                        <Box sx={{ bgcolor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 2, p: 1.75, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                          <Typography sx={{ fontSize: '1rem', lineHeight: 1, mt: 0.1 }}>✏️</Typography>
                          <Typography variant='body2' sx={{ color: '#b91c1c', fontWeight: 600, lineHeight: 1.5 }}>
                            Draw over the receipt number with your finger or mouse to highlight it for customers
                          </Typography>
                        </Box>

                        {/* Canvas */}
                        <Box ref={canvasContainerRef} sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, lineHeight: 0 }}>
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

                        {/* Undo / Clear */}
                        <Stack direction='row' spacing={1} sx={{ mb: 3 }}>
                          <Button variant='outlined' size='small' startIcon={<UndoOutlined />} onClick={handleUndo}
                            disabled={pathCount === 0} sx={{ flex: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                            Undo
                          </Button>
                          <Button variant='outlined' size='small' startIcon={<DeleteOutlineOutlined />} onClick={handleClearAll}
                            disabled={pathCount === 0} sx={{ flex: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                            Clear
                          </Button>
                          <Button variant='outlined' size='small' onClick={() => { setImgFile(null); pathsRef.current = []; setPathCount(0); }}
                            sx={{ flex: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
                            New photo
                          </Button>
                        </Stack>

                        <Button fullWidth variant='contained' size='large' onClick={handleSaveExample} disabled={isSavingExample}
                          sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', mb: 1.5, boxShadow: '0 4px 14px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.4)' } }}>
                          {isSavingExample ? <CircularProgress size={22} color='inherit' /> : 'Save & Continue →'}
                        </Button>

                        <Button fullWidth variant='text' onClick={() => { setImgFile(null); pathsRef.current = []; setPathCount(0); setStep(3); }}
                          sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
                          Skip for now
                        </Button>
                      </>
                    )}
                  </Box>
                </motion.div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <motion.div key='step-3' initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
                  <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

                    {/* Billing toggle */}
                    <Stack direction='row' alignItems='center' justifyContent='center' sx={{ bgcolor: 'action.hover', borderRadius: 2.5, p: 0.5, mb: 4 }}>
                      {(['monthly', 'yearly'] as const).map((interval) => (
                        <Box key={interval} onClick={() => setBillingInterval(interval)}
                          sx={{
                            flex: 1, textAlign: 'center', py: 1, px: 2, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                            bgcolor: billingInterval === interval ? 'background.paper' : 'transparent',
                            boxShadow: billingInterval === interval ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                          }}
                        >
                          <Typography variant='body2' fontWeight={700} color={billingInterval === interval ? 'text.primary' : 'text.secondary'} sx={{ textTransform: 'capitalize' }}>
                            {interval}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>

                    {/* Entries stepper */}
                    <Typography variant='h6' fontWeight={700} mb={0.5}>How many entries per location?</Typography>
                    <Typography variant='caption' color='text.secondary' display='block' mb={3}>per month</Typography>

                    <Stack direction='row' alignItems='center' justifyContent='center' spacing={2} sx={{ mb: 4 }}>
                      <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex - 1])} disabled={atMin}
                        sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMin ? 0.4 : 1 }}>
                        <Remove />
                      </IconButton>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant='h4' fontWeight={900} sx={{ minWidth: { xs: 160, md: 200 } }}>
                          {selectedTier.toLocaleString()} entries
                        </Typography>
                        <Typography variant='body2' color='text.secondary' mt={1}>
                          ${pricePerLocation.toLocaleString()} per location / month
                        </Typography>
                      </Box>
                      <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex + 1])} disabled={atMax}
                        sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMax ? 0.4 : 1 }}>
                        <Add />
                      </IconButton>
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    {/* Price breakdown */}
                    <Box sx={{ bgcolor: 'rgba(25,93,230,0.06)', borderRadius: 2.5, p: 3, mb: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='body2' color='text.secondary'>Entries per location</Typography>
                          <Typography variant='body2' fontWeight={700}>{selectedTier.toLocaleString()} / mo</Typography>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='body2' color='text.secondary'>Your locations</Typography>
                          {locationCount === null ? <Skeleton width={40} height={20} /> : <Typography variant='body2' fontWeight={700}>{effectiveLocationCount}</Typography>}
                        </Stack>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='body2' color='text.secondary'>Price per location</Typography>
                          <Typography variant='body2' fontWeight={700}>
                            {billingInterval === 'yearly' ? `$${yearlyPricePerLocation.toLocaleString()}/yr` : `$${pricePerLocation.toLocaleString()}`}
                          </Typography>
                        </Stack>
                        <Divider />
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <Typography variant='body2' fontWeight={700}>{billingInterval === 'yearly' ? 'Total per year' : 'Total per month'}</Typography>
                          <Typography variant='h5' fontWeight={900} sx={{ background: 'linear-gradient(135deg, #195DE2 0%, #7FA6FF 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {billingInterval === 'yearly' ? `$${totalYearly.toFixed(0)}` : `$${totalMonthly.toFixed(0)}`}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    {atMax && (
                      <Typography variant='body2' textAlign='center' sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
                        Need more than {MAX_TIER.toLocaleString()} entries?{' '}
                        <Typography component='span' variant='body2' sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => { window.location.href = 'mailto:support@winnbell.com'; }}>
                          Contact us
                        </Typography>{' '}for a custom plan.
                      </Typography>
                    )}

                    {error && <Typography variant='body2' color='error' textAlign='center' mb={2}>{error}</Typography>}

                    <Button fullWidth variant='contained' size='large' startIcon={loading ? undefined : <CreditCard />} onClick={handleSubscribe} disabled={loading}
                      sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 14px rgba(25,93,230,0.35)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.45)' } }}>
                      {loading ? <CircularProgress size={24} color='inherit' /> : 'Subscribe & Join Next Draw'}
                    </Button>

                    <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
                      {billingInterval === 'yearly'
                        ? "You'll be redirected to Stripe's secure checkout. Yearly plan covers 12 monthly draws."
                        : "You'll be redirected to Stripe's secure checkout. You'll enter the next monthly draw on payment."}
                    </Typography>

                    <Button fullWidth variant='text' size='small' onClick={() => navigate('/nearby')}
                      sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
                      I'll do it later
                    </Button>
                  </Box>
                </motion.div>
              )}

            </AnimatePresence>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SubscribePage;
