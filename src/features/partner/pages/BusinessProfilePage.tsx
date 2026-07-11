import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  Drawer,

} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Storefront,
  LocationOn,
  CheckCircle,
  ImageOutlined,
  PhoneOutlined,
  PublicOutlined,
  ExpandMore,
  InfoOutlined,
  SearchRounded,
  CheckRounded,
  Close,
  AddLocationAltOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { BUSINESS_SECTORS } from '../../admin/data';
import type { BusinessSetupInput } from '../types/business.types';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser, selectIsRequiresBusinessSetup } from '../../../store/selectors/authSelectors';
import AddressAutoComplete from '../../../shared/components/AddressAutoComplete';
import { useBusinessSetup } from '../hooks/useBusinessSetup';
import {
  GRADIENT_SIDEBAR,
  GRADIENT_DRAW_CARD,
  ALPHA_WHITE_10,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_70,
  ALPHA_PRIMARY_06,
  ALPHA_PRIMARY_10,
  BORDER_LIGHT,
  PRIMARY_MAIN,
  PRIMARY_LIGHT,
  BG_SUBTLE,
  TEXT_HEADING,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '../../../shared/colors';
import { staggerContainer, popIn, SPRING_POP } from '../../../shared/motion';
import LogoCropDialog from './components/LogoCropDialog';
import LocationsMap from './components/LocationsMap';

const STEPS = ['Business Info', 'Location'];
const logoBase = import.meta.env.VITE_R2_PUBLIC_URL;

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'white',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'box-shadow 0.15s ease',
    '& fieldset': { borderColor: BORDER_LIGHT, borderWidth: '1px' },
    '&:hover fieldset': { borderColor: BORDER_LIGHT },
    '&.Mui-focused fieldset': { borderColor: PRIMARY_MAIN, borderWidth: '1.5px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
  },
} as const;

const FieldLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: 0.9 }}>
    <Typography component='span' sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_SECONDARY }}>{children}</Typography>
    {hint && <Typography component='span' sx={{ fontSize: '0.72rem', fontWeight: 600, color: TEXT_TERTIARY }}>{hint}</Typography>}
  </Stack>
);

const BusinessProfilePage = () => {
  const user = useAppSelector(selectCurrentUser);
  const requiresBusinessSetup = useAppSelector(selectIsRequiresBusinessSetup);
  const navigate = useNavigate();

  // This wizard is only for businesses that still need setup. An owner who already finished
  // (or a manager) landing here by URL is sent back to their hub instead of a stray setup form.
  useEffect(() => {
    if (!requiresBusinessSetup) navigate('/nearby', { replace: true });
  }, [requiresBusinessSetup, navigate]);

  const [step, setStep] = useState(0);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [uploadedLogoKey, setUploadedLogoKey] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const registrationSectors = Object.keys(BUSINESS_SECTORS).filter((k) => k !== 'Free');

  const { control, handleSubmit, setValue, watch, trigger, setError } = useForm({
    defaultValues: {
      businessName: user?.fullName || '',
      businessSector: '',
      description: '',
      website_url: '',
      logo_url: '',
      locations: [{ name: 'Main Branch', address: '', lat: null as number | null, lon: null as number | null, suite: '', phone: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'locations' });
  const [expandedIndex, setExpandedIndex] = useState(0);

  const { mutate: setupBusiness, isPending } = useBusinessSetup();
  const [setupError, setSetupError] = useState('');

  const selectedSector = watch('businessSector');
  const businessName = watch('businessName');
  const description = watch('description');
  const watchedLocations = watch('locations');
  const descLen = (description || '').length;
  const sector = selectedSector ? BUSINESS_SECTORS[selectedSector] : null;

  const submit = (data: BusinessSetupInput) => {
    setSetupError('');
    setupBusiness(data, {
      // Show the server's actual validation message (e.g. "Website URL is not a valid
      // URL") - err.message on an HTTP error is just "Request failed with status 400".
      onError: (err: unknown) => setSetupError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          ?? (err instanceof Error ? err.message : 'Something went wrong. Please try again.'),
      ),
    });
  };

  const goNext = async () => {
    // Validate EVERY step-one field before advancing - including the optional website,
    // whose format rule would otherwise only surface as a failed submit at the very end.
    if (await trigger(['businessName', 'businessSector', 'website_url'])) setStep(1);
  };

  // Collapse the location being edited into a summary card and open a fresh one below.
  const addAnother = async () => {
    if (!(await trigger(`locations.${expandedIndex}.address` as const))) return;
    const current = watchedLocations?.[expandedIndex];
    if (current?.lat == null || current?.lon == null) {
      setError(`locations.${expandedIndex}.address` as const, { message: 'Please pick an address from the suggestions.' });
      return;
    }
    const next = fields.length;
    append({ name: '', address: '', lat: null, lon: null, suite: '', phone: '' });
    setExpandedIndex(next);
  };

  const removeLocationAt = (index: number) => {
    remove(index);
    setExpandedIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
  };

  const handleLogoUploadComplete = useCallback((key: string) => {
    setUploadedLogoKey(key);
    setValue('logo_url', key);
    setLogoDialogOpen(false);
    setLogoImageSrc(null);
  }, [setValue]);

  // "Add logo" opens the OS file picker straight away; once a file is chosen we jump to the cropper.
  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setLogoImageSrc(reader.result as string); setLogoDialogOpen(true); };
    reader.readAsDataURL(file);
  };

  const primaryBtnSx = {
    py: 1.75, borderRadius: '13px', fontWeight: 800, fontSize: '0.95rem', color: 'white',
    background: GRADIENT_DRAW_CARD, boxShadow: `0 12px 24px -8px ${alpha(PRIMARY_MAIN, 0.5)}`,
    '&:hover': { background: GRADIENT_DRAW_CARD, filter: 'brightness(0.96)' },
  } as const;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 'var(--dvh100, 100dvh)', height: { md: 'var(--dvh100, 100dvh)' }, overflow: { md: 'hidden' }, bgcolor: 'white' }}>

      {/* ══ Brand panel (collapses away on desktop step 2 so the map can take the stage) ══ */}
      <Box
        sx={{
          width: { xs: '100%', md: step === 1 ? 0 : '40%' }, flexShrink: 0, minWidth: 0,
          height: { xs: 'auto', md: 'var(--dvh100, 100dvh)' },
          background: GRADIENT_SIDEBAR, color: 'white', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          px: { xs: 1.5, md: step === 1 ? 0 : '44px' },
          pt: { xs: 'calc(env(safe-area-inset-top, 0px) + 10px)', md: '48px' },
          pb: { xs: '26px', md: '48px' },
          borderRadius: { xs: '0 0 26px 26px', md: 0 },
          // Desktop step 1 -> 2: the panel folds shut (width + padding) while its content fades
          // out faster, so nothing visibly squishes. Going back plays it in reverse.
          opacity: { xs: 1, md: step === 1 ? 0 : 1 },
          pointerEvents: { xs: 'auto', md: step === 1 ? 'none' : 'auto' },
          transition: 'width 0.55s cubic-bezier(0.22,1,0.36,1), padding 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease',
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_10, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: alpha(PRIMARY_LIGHT, 0.24), filter: 'blur(50px)', pointerEvents: 'none' }} />
        {/* Mobile orb: radial gradient, not filter:blur - the band is rounded on mobile and
            blurred children break its rounded clipping on Android. */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'absolute', top: -100, right: -80, width: 290, height: 290, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: { xs: 36, md: 26 }, width: 'auto', objectFit: 'contain' }} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, mt: { xs: 2, md: 'auto' } }}>
          <AnimatePresence mode='wait'>
            {step === 0 ? (
              <motion.div key='b1' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <Typography sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, fontSize: { xs: '1.4rem', md: '2.35rem' }, mb: { xs: 0.5, md: 2 } }}>Tell us about your brand.</Typography>
                <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' }, color: ALPHA_WHITE_70, lineHeight: 1.7, maxWidth: 340, mb: { xs: 0, md: 4 } }}>
                  Your name, logo and category are how customers recognize you on the map and in the app. You can change any of this later.
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 320 }}>
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={SPRING_POP}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6, p: 2, borderRadius: '16px', bgcolor: ALPHA_WHITE_10, border: `1px solid ${ALPHA_WHITE_20}`, backdropFilter: 'blur(4px)' }}>
                      <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: 'white', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, lineHeight: 1, color: sector ? sector.color : TEXT_TERTIARY }}>
                        {uploadedLogoKey
                          ? <Box component='img' src={`${logoBase}/business-logos/${uploadedLogoKey}`} alt='' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : sector ? sector.icon : <Storefront sx={{ fontSize: 26 }} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{businessName || 'Your business'}</Typography>
                        <Typography sx={{ mt: 0.3, fontSize: '0.75rem', fontWeight: 500, color: ALPHA_WHITE_70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sector ? sector.label : 'Add your details'}</Typography>
                      </Box>
                    </Box>
                    <Stack direction='row' alignItems='center' spacing={0.8} sx={{ mt: 1.25 }}>
                      <InfoOutlined sx={{ fontSize: 14, color: ALPHA_WHITE_70 }} />
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: ALPHA_WHITE_70 }}>This is how your listing will look to customers.</Typography>
                    </Stack>
                  </motion.div>
                </Box>
              </motion.div>
            ) : (
              <motion.div key='b2' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <Typography sx={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, fontSize: { xs: '1.4rem', md: '2.35rem' }, mb: { xs: 0.5, md: 2 } }}>Put yourself on the map.</Typography>
                <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.95rem' }, color: ALPHA_WHITE_70, lineHeight: 1.7, maxWidth: 340, mb: { xs: 0, md: 4 } }}>
                  Customers discover businesses by location. Drop your pin so nearby members can find you and earn entries.
                </Typography>
                <Stack spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  {[
                    { icon: <LocationOn sx={{ fontSize: 18 }} />, label: 'Shown on the nearby map with your pin' },
                    { icon: <CheckRounded sx={{ fontSize: 18 }} />, label: 'Members get directions in one tap' },
                  ].map((f, i) => (
                    <Stack key={i} direction='row' spacing={1.6} alignItems='center'>
                      <Box sx={{ width: 36, height: 36, borderRadius: '11px', bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</Box>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{f.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        <Stack spacing={1.5} sx={{ mt: 6, display: { xs: 'none', md: 'flex' }, position: 'relative', zIndex: 1 }}>
          {STEPS.map((label, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={1.5}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: i < step ? 'white' : i === step ? ALPHA_WHITE_20 : ALPHA_WHITE_10, border: `2px solid ${i <= step ? 'white' : ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < step ? <CheckCircle sx={{ fontSize: 17, color: PRIMARY_MAIN }} /> : <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: i === step ? 'white' : ALPHA_WHITE_70 }}>{i + 1}</Typography>}
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: i === step ? 800 : 500, opacity: i === step ? 1 : 0.65 }}>{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ══ Form panel / Content area ══ */}
      <Box sx={{ flex: 1, height: { md: 'var(--dvh100, 100dvh)' }, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Step 2: Two-panel layout on desktop, single-column on mobile */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
              {/* LEFT: Location List Panel */}
              <Box sx={{ width: { xs: '100%', md: 452 }, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: { xs: 'none', md: `1px solid ${BORDER_LIGHT}` }, borderBottom: { xs: `1px solid ${BORDER_LIGHT}`, md: 'none' }, bgcolor: 'white', overflowY: 'auto', minHeight: { xs: 'auto', md: 0 } }}>
                {/* Slides in from the left as the brand panel folds away */}
                <Box component={motion.div} initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }} sx={{ px: 3, py: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Step badge */}
                  <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 2.5 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>2</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_SECONDARY, letterSpacing: '0.5px' }}>Step 2 of 2 - Locations</Typography>
                  </Stack>

                  {/* Title */}
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING, mb: 0.5 }}>Where can customers find you?</Typography>

                  {/* Subtitle */}
                  <Typography sx={{ fontSize: '0.9rem', color: TEXT_TERTIARY, fontWeight: 500, mb: 2 }}>Add every branch where customers can earn entries. You can add more anytime.</Typography>

                  {/* List header: "Your locations · {count}" */}
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT_SECONDARY, mb: 1.5 }}>Your locations - {fields.length}</Typography>

                  {/* Scrollable location cards */}
                  <Stack spacing={1.375} sx={{ mb: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    {fields.map((f, index) => {
                      const isExpanded = expandedIndex === index;
                      const locName = watchedLocations?.[index]?.name;
                      const locAddr = watchedLocations?.[index]?.address;
                      const locLat = watchedLocations?.[index]?.lat ?? null;
                      const locLon = watchedLocations?.[index]?.lon ?? null;

                      return (
                        <motion.div key={f.id} layout transition={{ layout: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}>
                          <AnimatePresence mode='wait' initial={false}>
                            {isExpanded ? (
                              <motion.div key='exp' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
                                <Box sx={{ p: 2.25, borderRadius: '16px', border: `1.5px solid ${PRIMARY_MAIN}`, boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}`, bgcolor: 'white' }}>
                                  <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                                    <Stack direction='row' alignItems='center' spacing={1}>
                                      <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LocationOn sx={{ fontSize: 15, color: PRIMARY_MAIN }} /></Box>
                                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: TEXT_SECONDARY, letterSpacing: '-0.01em' }}>Location {index + 1}</Typography>
                                    </Stack>
                                    {fields.length > 1 && (
                                      <IconButton size='small' onClick={() => removeLocationAt(index)} sx={{ color: TEXT_TERTIARY }}><Close fontSize='small' /></IconButton>
                                    )}
                                  </Stack>
                                  <Stack spacing={2}>
                                    <Box>
                                      <FieldLabel>Branch name</FieldLabel>
                                      <Controller name={`locations.${index}.name`} control={control} render={({ field }) => (
                                        <TextField {...field} fullWidth size='small' placeholder='e.g. Downtown, Main Branch' sx={fieldSx} />
                                      )} />
                                    </Box>
                                    <Box>
                                      <FieldLabel>Street address</FieldLabel>
                                      <Controller name={`locations.${index}.address`} control={control} rules={{ required: 'Address is required' }} render={({ field: { onChange, value }, fieldState: { error } }) => {
                                        const addressValue = value && locLat != null && locLon != null ? { label: value, lat: locLat, lon: locLon } : null;
                                        return (
                                          <>
                                            {/* Wrap so the autocomplete input matches the sibling fields (small, 12px radius, same border/focus). */}
                                            <Box sx={fieldSx}>
                                              <AddressAutoComplete
                                                label=''
                                                placeholder='Start typing your address...'
                                                value={addressValue}
                                                size='small'
                                                onSelect={(sel) => {
                                                  onChange(sel?.label || '');
                                                  setValue(`locations.${index}.lat`, sel?.lat ?? null);
                                                  setValue(`locations.${index}.lon`, sel?.lon ?? null);
                                                }}
                                              />
                                            </Box>
                                            {error && <Typography sx={{ fontSize: '0.72rem', color: 'error.main', mt: 0.5, ml: 0.5 }}>{error.message}</Typography>}
                                          </>
                                        );
                                      }} />
                                    </Box>
                                    <Stack direction='row' spacing={1.75}>
                                      <Box sx={{ flex: 1 }}>
                                        <FieldLabel>Suite / unit <Box component='span' sx={{ color: TEXT_TERTIARY, fontWeight: 500 }}>(optional)</Box></FieldLabel>
                                        <Controller name={`locations.${index}.suite`} control={control} render={({ field }) => (
                                          <TextField {...field} fullWidth size='small' placeholder='e.g. Unit 4' sx={fieldSx} />
                                        )} />
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        <FieldLabel>Phone <Box component='span' sx={{ color: TEXT_TERTIARY, fontWeight: 500 }}>(optional)</Box></FieldLabel>
                                        <Controller name={`locations.${index}.phone`} control={control} render={({ field }) => (
                                          <TextField {...field} fullWidth size='small' placeholder='(302) 555-0142'
                                            InputProps={{ startAdornment: (<InputAdornment position='start'><PhoneOutlined sx={{ color: TEXT_TERTIARY, fontSize: 18 }} /></InputAdornment>) }} sx={fieldSx} />
                                        )} />
                                      </Box>
                                    </Stack>
                                  </Stack>
                                </Box>
                              </motion.div>
                            ) : (
                              <motion.div key='col' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <Box
                                  onClick={() => setExpandedIndex(index)}
                                  sx={{
                                    p: 1.75,
                                    borderRadius: '14px',
                                    border: `1px solid ${BORDER_LIGHT}`,
                                    bgcolor: 'white',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    '&:hover': { borderColor: PRIMARY_MAIN },
                                    ...(index === expandedIndex && { borderColor: PRIMARY_MAIN, boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` }),
                                  }}
                                >
                                  <Stack direction='row' alignItems='center' spacing={1.25}>
                                    <Box sx={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LocationOn sx={{ fontSize: 19, color: PRIMARY_MAIN }} /></Box>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT_HEADING, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.25 }}>{locName || `Location ${index + 1}`}</Typography>
                                      <Stack direction='row' alignItems='center' spacing={0.5}>
                                        <LocationOn sx={{ fontSize: 13, color: TEXT_TERTIARY, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '0.78rem', color: TEXT_TERTIARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locAddr || 'No address yet'}</Typography>
                                      </Stack>
                                    </Box>

                                    <Stack direction='row' alignItems='center' spacing={0.5} sx={{ flexShrink: 0 }}>
                                      <IconButton size='small' onClick={(e) => { e.stopPropagation(); setExpandedIndex(index); }} sx={{ color: TEXT_TERTIARY }}><EditOutlined fontSize='small' /></IconButton>
                                      {fields.length > 1 && (
                                        <IconButton size='small' onClick={(e) => { e.stopPropagation(); removeLocationAt(index); }} sx={{ color: TEXT_TERTIARY }}><DeleteOutlined fontSize='small' /></IconButton>
                                      )}
                                    </Stack>
                                  </Stack>
                                </Box>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </Stack>

                  {/* "Add another location" button */}
                  <Button
                    variant='outlined'
                    startIcon={<AddLocationAltOutlined />}
                    onClick={addAnother}
                    fullWidth
                    sx={{
                      fontWeight: 700,
                      borderRadius: '12px',
                      color: PRIMARY_MAIN,
                      borderColor: alpha(PRIMARY_MAIN, 0.4),
                      borderStyle: 'dashed',
                      borderWidth: '1.5px',
                      bgcolor: alpha(PRIMARY_MAIN, 0.02),
                      py: 1.15,
                      mb: 2.5,
                      '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: ALPHA_PRIMARY_10 },
                    }}
                  >
                    Add another location
                  </Button>

                </Box>
              </Box>

              {/* RIGHT: Map Panel - glides in from the right once the space has opened up */}
              <Box sx={{ flex: 1, minWidth: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', height: { md: '100%' }, overflow: 'hidden' }}>
                <motion.div
                  initial={{ opacity: 0, x: 48, scale: 0.985 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.55, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  style={{ flex: 1, minHeight: 0, position: 'relative' }}
                >
                  <LocationsMap
                    locations={watchedLocations || []}
                    activeIndex={expandedIndex}
                    sector={selectedSector}
                  />
                  {/* Floating actions on the map - always visible, no scrolling needed */}
                  <Stack direction='row' spacing={1.5} sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 5 }}>
                    <Button variant='outlined' startIcon={<ArrowBack />} onClick={() => setStep(0)}
                      sx={{ borderRadius: '13px', px: 2.75, py: 1.4, fontWeight: 800, color: TEXT_SECONDARY, bgcolor: 'white', borderColor: 'white', boxShadow: `0 10px 24px -8px ${alpha(TEXT_HEADING, 0.35)}`, '&:hover': { bgcolor: 'white', borderColor: BORDER_LIGHT } }}>
                      Back
                    </Button>
                    <Button type='submit' disabled={isPending} endIcon={isPending ? undefined : <CheckCircle />}
                      sx={{ ...primaryBtnSx, py: 1.4, px: 4 }}>
                      {isPending ? <CircularProgress size={20} color='inherit' /> : 'Complete setup'}
                    </Button>
                  </Stack>
                </motion.div>
              </Box>
            </Box>
          )}

          {/* Mobile & Desktop Step 0: Single-column form panel */}
          {step !== 1 && (
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ maxWidth: 620, width: '100%', mx: { xs: 0, md: 'auto' }, my: { md: 'auto' }, px: { xs: 2.5, sm: 4, md: 6 }, py: { xs: 2.5, md: 6 } }}>

              {step === 0 && (
                <motion.div initial='hidden' animate='visible' variants={staggerContainer}>
                  <Stack spacing={3}>
                    <motion.div variants={popIn}>
                      <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>Set up your business</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: TEXT_TERTIARY, fontWeight: 500, mt: 0.5 }}>A few details and you'll be live on Winnbell.</Typography>
                    </motion.div>

                    {/* logo + name */}
                    <motion.div variants={popIn}>
                      <Stack direction='row' spacing={2.25} alignItems='flex-start'>
                        <Box onClick={() => logoInputRef.current?.click()} sx={{ width: 96, height: 96, flexShrink: 0, borderRadius: '18px', cursor: 'pointer', overflow: 'hidden', border: uploadedLogoKey ? `1px solid ${BORDER_LIGHT}` : `2px dashed ${BORDER_LIGHT}`, bgcolor: BG_SUBTLE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.75, transition: 'border-color 0.15s ease', '&:hover': { borderColor: PRIMARY_MAIN } }}>
                          {uploadedLogoKey
                            ? <Box component='img' src={`${logoBase}/business-logos/${uploadedLogoKey}`} alt='logo' sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (<><ImageOutlined sx={{ fontSize: 24, color: TEXT_TERTIARY }} /><Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: TEXT_TERTIARY }}>Add logo</Typography></>)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <FieldLabel>Business name</FieldLabel>
                          <Controller name='businessName' control={control} rules={{ required: 'Business name is required' }} render={({ field, fieldState: { error } }) => (
                            <TextField {...field} fullWidth size='small' placeholder="e.g. Joe's Coffee" error={!!error} helperText={error?.message}
                              InputProps={{ startAdornment: (<InputAdornment position='start'><Storefront sx={{ color: PRIMARY_MAIN, fontSize: 19 }} /></InputAdornment>) }} sx={fieldSx} />
                          )} />
                          <Typography sx={{ fontSize: '0.72rem', color: TEXT_TERTIARY, fontWeight: 500, mt: 1 }}>PNG or SVG, at least 256x256px. Shown on your map pin.</Typography>
                        </Box>
                      </Stack>
                    </motion.div>

                    {/* description */}
                    <motion.div variants={popIn}>
                      <FieldLabel hint={`${descLen} / 60`}>Short description <Box component='span' sx={{ color: TEXT_TERTIARY, fontWeight: 500 }}>(optional)</Box></FieldLabel>
                      <Controller name='description' control={control} render={({ field }) => (
                        <TextField {...field} fullWidth size='small' placeholder='Neighborhood espresso and fresh pastries' inputProps={{ maxLength: 60 }} sx={fieldSx} />
                      )} />
                    </motion.div>

                    {/* website */}
                    <motion.div variants={popIn}>
                      <FieldLabel>Website <Box component='span' sx={{ color: TEXT_TERTIARY, fontWeight: 500 }}>(optional)</Box></FieldLabel>
                      <Controller
                        name='website_url'
                        control={control}
                        rules={{
                          // Same rule the server enforces: empty is fine; otherwise it must
                          // parse as a real http(s) URL. Telling the user at the field beats
                          // a failed submit.
                          validate: (value: string) => {
                            const s = (value ?? '').trim();
                            if (!s) return true;
                            if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https?:\/\//i.test(s)) {
                              return 'Website must start with http:// or https://';
                            }
                            try {
                              const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
                              return u.hostname.includes('.') || 'Please enter a valid website, e.g. bellascoffee.com';
                            } catch {
                              return 'Please enter a valid website, e.g. bellascoffee.com';
                            }
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextField {...field} fullWidth size='small' placeholder='bellascoffee.com'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            InputProps={{ startAdornment: (<InputAdornment position='start'><PublicOutlined sx={{ color: TEXT_TERTIARY, fontSize: 19 }} /></InputAdornment>) }} sx={fieldSx} />
                        )}
                      />
                    </motion.div>

                    {/* category */}
                    <motion.div variants={popIn}>
                      <Controller name='businessSector' control={control} rules={{ required: 'Please select a category' }} render={({ fieldState: { error } }) => (
                        <Box>
                          <FieldLabel>Category</FieldLabel>
                          <Box onClick={() => setCategoryPickerOpen(true)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, bgcolor: 'white', borderRadius: '12px', px: 1.75, py: sector ? 1.25 : 1.5, cursor: 'pointer', border: `${sector ? 1.5 : 1}px solid ${sector ? PRIMARY_MAIN : BORDER_LIGHT}`, boxShadow: sector ? `0 0 0 3px ${ALPHA_PRIMARY_10}` : 'none', transition: 'all 0.15s ease', '&:hover': { borderColor: PRIMARY_MAIN } }}>
                            {sector ? (
                              <Stack direction='row' alignItems='center' spacing={1.4} sx={{ minWidth: 0 }}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, bgcolor: alpha(sector.color, 0.14), color: sector.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>{sector.icon}</Box>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: TEXT_HEADING, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sector.label}</Typography>
                              </Stack>
                            ) : <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, color: TEXT_TERTIARY }}>Choose a category</Typography>}
                            <ExpandMore sx={{ fontSize: 22, color: sector ? PRIMARY_MAIN : TEXT_TERTIARY, flexShrink: 0 }} />
                          </Box>
                          {error && <Typography sx={{ fontSize: '0.72rem', color: 'error.main', mt: 0.5, ml: 0.5 }}>{error.message}</Typography>}
                        </Box>
                      )} />
                    </motion.div>

                    {/* desktop actions */}
                    <motion.div variants={popIn}>
                      <Box sx={{ display: { xs: 'none', md: 'flex' }, mt: 1 }}>
                        <Button fullWidth onClick={goNext} endIcon={<ArrowForward />} sx={primaryBtnSx}>Continue</Button>
                      </Box>
                    </motion.div>
                  </Stack>
                </motion.div>
              )}
              </Box>
            </Box>
          )}
          {/* mobile sticky CTA */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'sticky', bottom: 0, bgcolor: 'white', borderTop: `1px solid ${BORDER_LIGHT}`, px: 2.5, pt: 1.75, pb: 2.75 }}>
            {step === 0 ? (
              <>
                <Button fullWidth onClick={goNext} endIcon={<ArrowForward />} sx={{ ...primaryBtnSx, py: 1.6, borderRadius: '14px' }}>Continue</Button>
                <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: TEXT_TERTIARY, fontWeight: 600, mt: 1 }}>You can edit all of this later</Typography>
              </>
            ) : (
              <Stack direction='row' spacing={1.25} alignItems='center'>
                <Button variant='outlined' onClick={() => setStep(0)} sx={{ minWidth: 52, width: 52, height: 50, p: 0, flexShrink: 0, borderRadius: '14px', color: TEXT_SECONDARY, borderColor: BORDER_LIGHT }}><ArrowBack /></Button>
                <Button type='submit' fullWidth disabled={isPending} endIcon={isPending ? undefined : <CheckCircle />} sx={{ flex: 1, ...primaryBtnSx, py: 1.6, borderRadius: '14px' }}>
                  {isPending ? <CircularProgress size={20} color='inherit' /> : 'Complete setup'}
                </Button>
              </Stack>
            )}
          </Box>
        </form>
      </Box>

      <input ref={logoInputRef} type='file' accept='image/*' onChange={handleLogoFile} style={{ display: 'none' }} />
      <LogoCropDialog open={logoDialogOpen} imageSrc={logoImageSrc ?? undefined} onClose={() => { setLogoDialogOpen(false); setLogoImageSrc(null); }} onUploadComplete={handleLogoUploadComplete} />

      {/* Setup errors surface as a toast so they are never buried below the fold */}
      <Snackbar
        open={!!setupError}
        autoHideDuration={6000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setSetupError(''); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity='error' variant='filled' onClose={() => setSetupError('')} sx={{ borderRadius: '12px', boxShadow: `0 12px 28px -8px ${alpha(TEXT_HEADING, 0.4)}` }}>
          {setupError}
        </Alert>
      </Snackbar>

      <CategoryPicker
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        sectors={registrationSectors}
        selectedSector={selectedSector}
        searchValue={categorySearch}
        onSearchChange={setCategorySearch}
        onSelectSector={(key) => { setValue('businessSector', key, { shouldValidate: true }); setCategoryPickerOpen(false); setCategorySearch(''); }}
      />
    </Box>
  );
};

interface CategoryPickerProps {
  open: boolean;
  onClose: () => void;
  sectors: string[];
  selectedSector: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSelectSector: (key: string) => void;
}

const CategoryPicker = ({ open, onClose, sectors, selectedSector, searchValue, onSearchChange, onSelectSector }: CategoryPickerProps) => {
  const filtered = sectors.filter((k) => BUSINESS_SECTORS[k].label.toLowerCase().includes(searchValue.toLowerCase()));

  const list = (
    <Box sx={{ px: 1.25, pb: 1.25 }}>
      <Box sx={{ py: 1.25 }}>
        <TextField fullWidth size='small' placeholder={`Search ${sectors.length} categories...`} value={searchValue} onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position='start'><SearchRounded sx={{ fontSize: 18, color: TEXT_TERTIARY }} /></InputAdornment>) }}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: BG_SUBTLE, borderRadius: '10px', '& fieldset': { borderColor: BORDER_LIGHT } } }} />
      </Box>
      <Stack spacing={0.5} sx={{ maxHeight: 320, overflowY: 'auto' }}>
        {filtered.map((key) => {
          const s = BUSINESS_SECTORS[key];
          const isSel = key === selectedSector;
          return (
            <motion.div key={key} whileTap={{ scale: 0.98 }}>
              <Box onClick={() => onSelectSector(key)} sx={{ display: 'flex', alignItems: 'center', gap: 1.4, px: 1.4, py: 1.1, borderRadius: '10px', cursor: 'pointer', bgcolor: isSel ? ALPHA_PRIMARY_06 : 'transparent', transition: 'background 0.12s ease', '&:hover': { bgcolor: isSel ? ALPHA_PRIMARY_06 : BG_SUBTLE } }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, bgcolor: alpha(s.color, 0.14), color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>{s.icon}</Box>
                <Typography sx={{ flex: 1, fontSize: '0.92rem', fontWeight: isSel ? 800 : 600, color: isSel ? TEXT_HEADING : TEXT_SECONDARY }}>{s.label}</Typography>
                {isSel && <CheckRounded sx={{ fontSize: 19, color: PRIMARY_MAIN }} />}
              </Box>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <Typography sx={{ textAlign: 'center', color: TEXT_TERTIARY, fontSize: '0.85rem', py: 3 }}>No categories match "{searchValue}".</Typography>}
      </Stack>
    </Box>
  );

  return (
    <>
      <Drawer anchor='bottom' open={open} onClose={onClose} sx={{ display: { xs: 'block', md: 'none' } }} PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '80dvh' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}><Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: BORDER_LIGHT }} /></Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: TEXT_HEADING, px: 2.25, pt: 1.5, pb: 0.5 }}>Choose a category</Typography>
        {list}
      </Drawer>
      <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth sx={{ display: { xs: 'none', md: 'block' } }} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: TEXT_HEADING, px: 2.5, pt: 2.25 }}>Choose a category</Typography>
        {list}
      </Dialog>
    </>
  );
};

export default BusinessProfilePage;
