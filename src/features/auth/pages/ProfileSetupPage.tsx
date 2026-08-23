import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Alert,
  useMediaQuery, useTheme, Grid,
  Select, MenuItem, IconButton,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { Warning, Female, Male, Transgender, MoreHoriz, CheckCircle, ArrowBackIosNew, PhoneOutlined, ChevronRight, CalendarToday, LocationOn } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { completeProfileSetup } from '../../../store/slices/authSlice';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { api } from '../../../shared/api/client';
import { useLogout } from '../../../shared/hooks/useLogout';
import { trackFunnel } from '../../../shared/analytics/funnel';
import {
  BG_SUBTLE, BG_SURFACE, BG_ROW_SUBTLE, BORDER_LIGHT, BORDER_SUBTLE,
  PRIMARY_MAIN, PRIMARY_TINT, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10,
  TEXT_SECONDARY, TEXT_TERTIARY, TEXT_TERTIARY_AA, TEXT_HEADING, AMBER_TEXT_AA_TINT,
  GRADIENT_HERO, GRADIENT_HERO_WARM, GRADIENT_CTA,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, SHADOW_PRIMARY_MEDIUM,
  SHADOW_CARD,
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
} from '../../../shared/colors';
import { staggerContainer, popIn, riseIn } from '../../../shared/motion';
import { US_STATES } from '../../../shared/constants/usStates';
import { queryKeys } from '../../../shared/constants/queryKeys';
import PhoneVerifySheet from '../../tickets/components/PhoneVerifySheet';
import ReferralBonusSuccessDialog from '../../tickets/components/ReferralBonusSuccessDialog';

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;
type Gender = typeof GENDERS[number];

const GENDER_ICONS: Record<Gender, typeof Female> = {
  'Female': Female,
  'Male': Male,
  'Other': Transgender,
  'Prefer not to say': MoreHoriz,
};

interface ProfileSetupRequest {
  dateOfBirth: string;
  gender: string;
  state: string;
}

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();

  const isBusiness = useAppSelector(selectIsBusiness);
  const isLocationManager = useAppSelector(selectIsLocationManager);
  // Setup is a gate with no in-app destination behind it: "back" here means leaving
  // this account, so the back affordance signs out (per-account logout semantics).
  const handleLogout = useLogout();

  useEffect(() => { trackFunnel('profile_setup_viewed'); }, []);

  const [dob, setDob] = useState<Dayjs | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | ''>('');
  const [selectedState, setSelectedState] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Optional phone verification (design Turn 10, consumers only): a collapsed add-phone
  // button leading the form; clicking opens the standard one-time OTP sheet, so the number
  // is verified AND persisted by the existing /phone flow - the setup payload never
  // carries it. Managers and business owners skip this entirely (entry gates are a
  // consumer concern).
  const isConsumer = !isBusiness && !isLocationManager;
  const queryClient = useQueryClient();
  const [phoneSheetOpen, setPhoneSheetOpen] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  // "+1 (212) 555-0148" for the verified card; null when the digits are unavailable.
  const verifiedPhoneDisplay = verifiedPhone && verifiedPhone.length === 10
    ? `+1 (${verifiedPhone.slice(0, 3)}) ${verifiedPhone.slice(3, 6)}-${verifiedPhone.slice(6)}`
    : null;

  const handlePhoneVerified = (referralBonusGranted: boolean, phoneNumber?: string) => {
    setPhoneVerified(true);
    setVerifiedPhone(phoneNumber ?? null);
    // Entry gates read verification from the risk-level query - refresh it so /scan
    // never re-prompts a user who verified right here.
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.riskLevel });
    if (referralBonusGranted) setBonusDialogOpen(true);
  };

  // States where Winnbell operates (platform setting). Empty list = no restriction,
  // in which case every U.S. state is offered.
  const { data: regionConfig } = useQuery({
    queryKey: ['auth', 'region-config'],
    queryFn: async () => (await api.get<{ allowed_states: string[] }>('/auth/region-config')).data,
    staleTime: 10 * 60_000,
  });
  const allowedCodes = regionConfig?.allowed_states ?? [];
  const stateOptions = allowedCodes.length > 0
    ? US_STATES.filter((s) => allowedCodes.includes(s.code))
    : US_STATES;

  // Derived: age check runs on every render, no effect needed.
  const dobError = dob !== null && dob.isValid() && dayjs().diff(dob, 'year') < 18
    ? 'You must be 18 or older to use Winnbell.'
    : '';

  const mutation = useMutation({
    mutationFn: async (payload: ProfileSetupRequest) => {
      const response = await api.post<{ message: string }>('/auth/profile-setup', payload);
      return response.data;
    },
  });

  const handleSubmit = () => {
    setSubmitError('');

    if (!dob || !dob.isValid()) {
      setSubmitError('Please enter your date of birth.');
      return;
    }

    if (dobError) {
      return;
    }

    if (!selectedGender) {
      setSubmitError('Please select a gender.');
      return;
    }

    if (!selectedState) {
      setSubmitError('Please select your state.');
      return;
    }

    const dateOfBirth = dob.format('YYYY-MM-DD');
    mutation.mutate(
      { dateOfBirth, gender: selectedGender, state: selectedState },
      {
        onSuccess: () => {
          dispatch(completeProfileSetup({ dateOfBirth, gender: selectedGender, state: selectedState }));
          navigate(homeDest, { replace: true });
        },
        onError: (error: unknown) => {
          // Surface the server's specific validation message (age, gender) when it sent one.
          const msg = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
          setSubmitError(msg ?? 'Something went wrong. Please try again.');
        },
      }
    );
  };

  const homeDest = isBusiness || isLocationManager ? '/campaign' : '/scan';

  // MUI X date picker, year-first: picking a birth date starts at the year grid instead of
  // paging month-by-month through decades. Desktop gets a popover calendar, mobile a dialog.
  const dobPicker = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        openTo="year"
        views={['year', 'month', 'day']}
        value={dob}
        onChange={(value) => setDob(value)}
        // The year grid tops out at 18 years back - the minimum eligible age - so the picker
        // opens into plausible birth years AND cannot select an under-18 date. The 18+ check
        // (client + server) still validates the exact date on submit.
        maxDate={dayjs().subtract(18, 'year')}
        minDate={dayjs().subtract(120, 'year')}
        slotProps={{
          // x-date-pickers v9 renders its own PickersTextField DOM, so the shared
          // authInputSx (MuiOutlinedInput) doesn't reach it - mirror it on the pickers classes.
          textField: {
            fullWidth: true,
            // PickersTextField has no InputProps; the adornment goes on its input slot.
            slotProps: {
              input: {
                startAdornment: (
                  <CalendarToday className='wb-field-icon' sx={{ fontSize: 18, color: TEXT_TERTIARY, mr: 1 }} />
                ),
              },
            },
            sx: {
              '& .MuiPickersOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: '12px',
                fontSize: '14.5px',
                fontWeight: 600,
                color: TEXT_HEADING,
                '& .MuiPickersOutlinedInput-notchedOutline': { borderColor: BORDER_LIGHT, borderWidth: '1px' },
                '&:hover .MuiPickersOutlinedInput-notchedOutline': { borderColor: BORDER_LIGHT },
                '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': { borderColor: PRIMARY_MAIN, borderWidth: '1.5px' },
                '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
                '&.Mui-focused .wb-field-icon': { color: PRIMARY_MAIN },
                // Empty MM/DD/YYYY placeholder: MUI dims the whole sectionsContainer to 0.42
                // opacity, compositing the text below WCAG AA. Keep the container at full
                // opacity and de-emphasize via an AA-safe color on the empty sections instead.
                // Filled sections keep TEXT_HEADING above.
                '& .MuiPickersInputBase-sectionsContainer': { opacity: 1 },
                '& [role="spinbutton"][aria-valuetext="Empty"]': { color: TEXT_TERTIARY_AA },
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );

  // State of residence: only states where Winnbell operates are offered.
  const statePicker = (
    <Select
      value={selectedState}
      onChange={(e) => setSelectedState(e.target.value)}
      displayEmpty
      fullWidth
      inputProps={{ 'aria-label': 'State of residence' }}
      renderValue={(code) => {
        if (!code) return <Box component='span' sx={{ color: TEXT_TERTIARY }}>Select your state</Box>;
        return US_STATES.find((s) => s.code === code)?.name ?? code;
      }}
      MenuProps={{ PaperProps: { sx: { maxHeight: 320, borderRadius: '12px' } } }}
      startAdornment={<LocationOn className='wb-field-icon' sx={{ fontSize: 18, color: TEXT_TERTIARY, mr: 0.75 }} />}
      sx={{
        bgcolor: 'white',
        borderRadius: '12px',
        fontSize: '14.5px',
        fontWeight: 600,
        color: TEXT_HEADING,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER_LIGHT, borderWidth: '1px' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: BORDER_LIGHT },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY_MAIN, borderWidth: '1.5px' },
        '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
        '&.Mui-focused .wb-field-icon': { color: PRIMARY_MAIN },
      }}
    >
      {stateOptions.map((s) => (
        <MenuItem key={s.code} value={s.code} sx={{ fontSize: '14px', fontWeight: 600 }}>
          {s.name}
        </MenuItem>
      ))}
    </Select>
  );

  // Phone group (consumers only, design Turn 11): a white CARD, not a control - the
  // selected-input treatment made an optional item outshout the required fields. Two
  // lines (action + why), tinted icon tile, chevron affordance. The verified state keeps
  // the exact same card and swaps the tile to the activated green, showing the number.
  const phoneGroup = phoneVerified ? (
    <Box
      sx={{
        width: '100%', borderRadius: '16px',
        border: `1px solid ${BORDER_SUBTLE}`, bgcolor: BG_SURFACE, boxShadow: SHADOW_CARD,
        display: 'flex', alignItems: 'center', gap: '12px', px: '16px', py: '13px',
      }}
    >
      <Box sx={{
        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
        bgcolor: STATUS_ACTIVATED_BG, color: STATUS_ACTIVATED_TEXT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING, lineHeight: 1.3 }}>
          Phone verified
        </Typography>
        {verifiedPhoneDisplay && (
          <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: TEXT_SECONDARY, mt: '2px' }}>
            {verifiedPhoneDisplay}
          </Typography>
        )}
      </Box>
      <Box component='span' sx={{
        fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.04em',
        color: STATUS_ACTIVATED_TEXT, bgcolor: STATUS_ACTIVATED_BG,
        px: '7px', py: '3px', borderRadius: '6px', flexShrink: 0,
      }}>
        VERIFIED
      </Box>
    </Box>
  ) : (
    <motion.button
      type='button'
      whileTap={{ scale: 0.97 }}
      onClick={() => setPhoneSheetOpen(true)}
      aria-haspopup='dialog'
      style={{
        width: '100%', borderRadius: '16px',
        border: `1px solid ${BORDER_SUBTLE}`, background: BG_SURFACE, boxShadow: SHADOW_CARD,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '13px 16px', fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      <span style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: PRIMARY_TINT, color: PRIMARY_MAIN,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PhoneOutlined sx={{ fontSize: 19 }} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: TEXT_HEADING, lineHeight: 1.3 }}>
          Verify your phone
        </span>
        <span style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: TEXT_SECONDARY, marginTop: '2px' }}>
          Skip extra checks when you submit receipts.
        </span>
      </span>
      <ChevronRight sx={{ fontSize: 20, color: TEXT_TERTIARY, flexShrink: 0 }} />
    </motion.button>
  );

  // The verification sheet + referral congrats, rendered by both layouts. The congrats CTA
  // says "Continue setup": entries are unreachable until this gate completes.
  const phoneOverlays = isConsumer ? (
    <>
      <PhoneVerifySheet
        open={phoneSheetOpen}
        onClose={() => setPhoneSheetOpen(false)}
        onVerified={handlePhoneVerified}
        context='setup'
      />
      <ReferralBonusSuccessDialog
        open={bonusDialogOpen}
        onViewEntries={() => setBonusDialogOpen(false)}
        ctaLabel='Continue setup'
      />
    </>
  ) : null;

  // Gender cards: icon tile + label, gradient tile and soft ring when selected.
  // Desktop uses the design's 12b variant - one row of four stacked tiles (icon over
  // label, check as a corner badge) so the gender block stops being half the card.
  // Mobile keeps the 2x2 inline rows; a four-way row at 390px squeezes tap targets.
  const renderGenderCards = (stacked: boolean) => (
    <Grid container spacing={1.25}>
      {GENDERS.map((gender) => {
        const selected = selectedGender === gender;
        const Icon = GENDER_ICONS[gender];
        return (
          <Grid size={{ xs: stacked ? 3 : 6 }} key={gender}>
            <motion.button
              variants={popIn}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedGender(gender)}
              style={{
                width: '100%',
                height: '100%',
                position: stacked ? 'relative' : undefined,
                border: selected ? `1.5px solid ${PRIMARY_MAIN}` : `1px solid ${BORDER_LIGHT}`,
                background: selected ? ALPHA_PRIMARY_06 : 'white',
                borderRadius: '14px',
                padding: stacked ? '11px 6px 10px' : '11px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: stacked ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: stacked ? 'flex-start' : undefined,
                gap: stacked ? '9px' : '10px',
                transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
                boxShadow: selected ? `0 0 0 3px ${ALPHA_PRIMARY_10}` : 'none',
                fontFamily: 'inherit',
                fontSize: stacked ? '11.5px' : '13.5px',
                fontWeight: selected ? 800 : 600,
                color: TEXT_HEADING,
                textAlign: stacked ? 'center' : 'left',
              }}
            >
              <span
                style={{
                  width: stacked ? '32px' : '34px',
                  height: stacked ? '32px' : '34px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: selected ? GRADIENT_CTA : ALPHA_PRIMARY_06,
                  color: selected ? 'white' : PRIMARY_MAIN,
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                <Icon sx={{ fontSize: 19 }} />
              </span>
              <span style={{ flex: stacked ? undefined : 1, minWidth: 0, lineHeight: 1.25 }}>{gender}</span>
              {selected && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={
                    stacked
                      ? { display: 'flex', position: 'absolute', top: 6, right: 6 }
                      : { display: 'flex', flexShrink: 0 }
                  }
                >
                  <CheckCircle sx={{ fontSize: stacked ? 15 : 17, color: PRIMARY_MAIN }} />
                </motion.span>
              )}
            </motion.button>
          </Grid>
        );
      })}
    </Grid>
  );
  const genderCards = renderGenderCards(false);

  // The CTA only attracts when the form is actually submittable (design Turn 11): the
  // AttractButton's breathe + sweep both stop on disabled by themselves.
  const canSubmit = !!(dob && dob.isValid() && !dobError && selectedGender && selectedState);

  // The legal notice as the details card's FOOTER strip (not floating amber mid-scroll).
  const legalFooter = (
    <Box sx={{ bgcolor: BG_ROW_SUBTLE, borderTop: `1px solid ${BORDER_SUBTLE}`, px: 2, py: 1.5, mx: -2, mb: -2, mt: 2.25, borderRadius: '0 0 16px 16px' }}>
      <Typography variant="caption" sx={{ lineHeight: 1.5, color: AMBER_TEXT_AA_TINT, display: 'block' }}>
        <Warning sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.5, color: AMBER_TEXT_AA_TINT }} />
        <strong>Legal notice:</strong> Falsely declaring your age or residency is a criminal offence. If a prize winner is found to be under 18 or not a legal U.S. resident, their winnings will be immediately cancelled.
      </Typography>
    </Box>
  );

  const fieldLabelSx = { fontSize: '12.5px', fontWeight: 700, color: TEXT_SECONDARY, marginBottom: '8px' };

  // ─── Desktop Layout ──────────────────────────────────────────────────────────

  if (isDesktop) {
    return (
      <Box sx={{ display: 'flex', minHeight: 'var(--dvh100, 100dvh)' }}>
        {/* Left Brand Panel */}
        <AuthBrandPanel
          isBusinessVariant={isLocationManager}
          headline="Almost in."
          tagline="A few quick details so we can confirm you're eligible and tailor draws to you."
          bullets={[]}
        />

        {/* Right Form Panel - BG_SUBTLE so the white cards read as surfaces (Turn 11) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '28px 56px',
            background: BG_SUBTLE,
          }}
        >
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <Box sx={{ maxWidth: 440, width: '100%', mx: 'auto' }}>
              {/* Heading - back chip like the login/register pages. Setup has no page
                  behind it, so back signs the user out. */}
              <motion.div variants={riseIn}>
                <Stack direction="row" alignItems="center" gap={2} sx={{ marginBottom: '6px' }}>
                  <IconButton
                    aria-label="Sign out"
                    onClick={handleLogout}
                    sx={{ bgcolor: 'white', border: `1px solid ${BORDER_LIGHT}`, flexShrink: 0 }}
                  >
                    <ArrowBackIosNew fontSize="small" />
                  </IconButton>
                  <Typography
                    sx={{
                      fontSize: '28px',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: TEXT_HEADING,
                    }}
                  >
                    Set up your profile
                  </Typography>
                </Stack>
              </motion.div>

              {/* Subtitle */}
              <motion.div variants={riseIn}>
                <Typography
                  sx={{
                    fontSize: '14.5px',
                    color: TEXT_TERTIARY,
                    fontWeight: 500,
                    marginBottom: '28px',
                  }}
                >
                  Just a few quick details to finish.
                </Typography>
              </motion.div>

              {/* Form Fields */}
              <Stack spacing={3}>
                {/* Error Alert */}
                {submitError && (
                  <motion.div variants={popIn}>
                    <Alert severity="error">{submitError}</Alert>
                  </motion.div>
                )}

                {/* Optional phone (consumers only) - leads the form, above Date of birth */}
                {isConsumer && (
                  <motion.div variants={popIn}>
                    {phoneGroup}
                  </motion.div>
                )}

                {/* Required fields grouped in ONE card, legal notice as its footer strip */}
                <motion.div variants={popIn}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_TERTIARY, mb: 1 }}>
                      Your details
                    </Typography>
                    <Box sx={{ bgcolor: BG_SURFACE, borderRadius: '16px', border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD, p: 2, overflow: 'hidden' }}>
                      <Stack spacing={2.25}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={fieldLabelSx}>Date of birth</Typography>
                            {dobPicker}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={fieldLabelSx}>State of residence</Typography>
                            {statePicker}
                          </Box>
                        </Box>
                        {dobError && (
                          <motion.div variants={popIn}>
                            <Alert severity="error">{dobError}</Alert>
                          </motion.div>
                        )}
                        <Box>
                          <Typography sx={{ ...fieldLabelSx, marginBottom: '11px' }}>Gender</Typography>
                          {renderGenderCards(true)}
                        </Box>
                      </Stack>
                      {legalFooter}
                    </Box>
                  </Box>
                </motion.div>

                {/* Action Row - no back button, this step is a gate */}
                <motion.div variants={popIn}>
                  <Stack direction="row" spacing={2} sx={{ mt: '2px' }}>
                    <AttractButton
                      fullWidth
                      onClick={handleSubmit}
                      disabled={mutation.isPending || !canSubmit}
                      sx={{
                        borderRadius: '13px',
                        padding: '15px',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'white',
                        background: GRADIENT_CTA,
                        boxShadow: SHADOW_PRIMARY_MEDIUM,
                        textTransform: 'none',
                        '&:hover:not(:disabled)': {
                          background: GRADIENT_CTA,
                          opacity: 0.95,
                        },
                        '&:disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      {mutation.isPending ? 'Setting up...' : 'Finish setup'}
                    </AttractButton>
                  </Stack>
                </motion.div>

            
              </Stack>
            </Box>
          </motion.div>
        </Box>
        {phoneOverlays}
      </Box>
    );
  }

  // ─── Mobile Layout ──────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: 'var(--dvh100, 100dvh)',
        display: 'flex',
        flexDirection: 'column',
        background: BG_SUBTLE,
      }}
    >
      {/* Gradient header band - mirrors the main layout's AppPageHero: brand row (back arrow +
          app name) then the title block, radial glow orb (filter:blur breaks the band's
          rounded-bottom clipping on Android). */}
      <Box
        sx={{
          background: isLocationManager ? GRADIENT_HERO_WARM : GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 28px 28px',
          px: 1.5,
          pt: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          pb: 2.5,
          flexShrink: 0,
        }}
      >
        {/* Glow orb */}
        <Box sx={{ position: 'absolute', top: -110, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

        {/* Brand row: back chip + app name, styled like the login/register gradient bands.
            Setup is a gate with nothing behind it, so back signs the user out. */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ position: 'relative' }}>
          <IconButton
            aria-label="Sign out"
            onClick={handleLogout}
            sx={{
              width: 40, height: 40, color: 'white', bgcolor: ALPHA_WHITE_15,
              border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '10px', flexShrink: 0,
              '&:hover': { bgcolor: ALPHA_WHITE_30 },
            }}
          >
            <ArrowBackIosNew sx={{ fontSize: 18 }} />
          </IconButton>
          <Box component="img" src="/winnbell_app_name_white.svg" alt="Winnbell" sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
        </Stack>

        {/* Title block */}
        <Box sx={{ position: 'relative', mt: 1.5, px: 1 }}>
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
            Set up profile
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.25 }}>
            Just a few quick details to finish.
          </Typography>
        </Box>
      </Box>

      {/* Form Content */}
      <Box sx={{ flex: 1, padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <Stack spacing={3}>
            {/* Error Alert */}
            {submitError && (
              <motion.div variants={popIn}>
                <Alert severity="error">{submitError}</Alert>
              </motion.div>
            )}

            {/* Optional phone (consumers only) - leads the form, above Date of birth */}
            {isConsumer && (
              <motion.div variants={popIn}>
                {phoneGroup}
              </motion.div>
            )}

            {/* Required fields grouped in ONE card, legal notice as its footer strip */}
            <motion.div variants={popIn}>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_TERTIARY, mb: 1 }}>
                  Your details
                </Typography>
                <Box sx={{ bgcolor: BG_SURFACE, borderRadius: '16px', border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD, p: 2, overflow: 'hidden' }}>
                  <Stack spacing={2.25}>
                    <Box>
                      <Typography sx={fieldLabelSx}>Date of birth</Typography>
                      {dobPicker}
                      {dobError && (
                        <motion.div variants={popIn}>
                          <Alert severity="error" sx={{ mt: 1.5 }}>
                            {dobError}
                          </Alert>
                        </motion.div>
                      )}
                    </Box>
                    <Box>
                      <Typography sx={fieldLabelSx}>State of residence</Typography>
                      {statePicker}
                    </Box>
                    <Box>
                      <Typography sx={{ ...fieldLabelSx, marginBottom: '10px' }}>Gender</Typography>
                      {genderCards}
                    </Box>
                  </Stack>
                  {legalFooter}
                </Box>
              </Box>
            </motion.div>
          </Stack>
        </motion.div>
      </Box>

      {/* CTA - pinned near bottom, in normal flow (user preference: no sticky, no dock band) */}
      <Box
        sx={{
          flexShrink: 0,
          padding: '18px 22px',
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
        }}
      >
        <motion.div variants={popIn}>
          <AttractButton
            fullWidth
            onClick={handleSubmit}
            disabled={mutation.isPending || !canSubmit}
            sx={{
              borderRadius: '14px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              color: 'white',
              background: GRADIENT_CTA,
              boxShadow: SHADOW_PRIMARY_MEDIUM,
              textTransform: 'none',
              '&:hover:not(:disabled)': {
                background: GRADIENT_CTA,
                opacity: 0.95,
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            {mutation.isPending ? 'Setting up...' : 'Finish setup'}
          </AttractButton>

        </motion.div>
      </Box>
      {phoneOverlays}
    </Box>
  );
};

export default ProfileSetupPage;
