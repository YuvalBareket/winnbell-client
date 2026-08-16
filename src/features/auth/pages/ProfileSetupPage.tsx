import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Alert,
  useMediaQuery, useTheme, Grid,
  Select, MenuItem, IconButton,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { Warning, Female, Male, Transgender, MoreHoriz, CheckCircle, ArrowBackIosNew } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { completeProfileSetup } from '../../../store/slices/authSlice';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { api } from '../../../shared/api/client';
import { useLogout } from '../../../shared/hooks/useLogout';
import { trackFunnel } from '../../../shared/analytics/funnel';
import {
  BG_PAGE, BORDER_LIGHT, PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10,
  TEXT_SECONDARY, TEXT_TERTIARY, TEXT_TERTIARY_AA, TEXT_HEADING, AMBER_TEXT_AA,
  GRADIENT_HERO, GRADIENT_HERO_WARM, GRADIENT_CTA,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, SHADOW_PRIMARY_MEDIUM,
} from '../../../shared/colors';
import { staggerContainer, popIn, riseIn } from '../../../shared/motion';
import { US_STATES } from '../../../shared/constants/usStates';

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
      }}
    >
      {stateOptions.map((s) => (
        <MenuItem key={s.code} value={s.code} sx={{ fontSize: '14px', fontWeight: 600 }}>
          {s.name}
        </MenuItem>
      ))}
    </Select>
  );

  // Gender cards: icon tile + label, gradient tile and soft ring when selected.
  const genderCards = (
    <Grid container spacing={1.25}>
      {GENDERS.map((gender) => {
        const selected = selectedGender === gender;
        const Icon = GENDER_ICONS[gender];
        return (
          <Grid size={{ xs: 6 }} key={gender}>
            <motion.button
              variants={popIn}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedGender(gender)}
              style={{
                width: '100%',
                border: selected ? `1.5px solid ${PRIMARY_MAIN}` : `1px solid ${BORDER_LIGHT}`,
                background: selected ? ALPHA_PRIMARY_06 : 'white',
                borderRadius: '14px',
                padding: '11px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
                boxShadow: selected ? `0 0 0 3px ${ALPHA_PRIMARY_10}` : 'none',
                fontFamily: 'inherit',
                fontSize: '13.5px',
                fontWeight: selected ? 800 : 600,
                color: TEXT_HEADING,
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: '34px',
                  height: '34px',
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
              <span style={{ flex: 1, minWidth: 0 }}>{gender}</span>
              {selected && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ display: 'flex', flexShrink: 0 }}
                >
                  <CheckCircle sx={{ fontSize: 17, color: PRIMARY_MAIN }} />
                </motion.span>
              )}
            </motion.button>
          </Grid>
        );
      })}
    </Grid>
  );

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

        {/* Right Form Panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 56px',
            background: BG_PAGE,
          }}
        >
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
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

                {/* Date of birth + state of residence, side by side */}
                <motion.div variants={popIn}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: TEXT_SECONDARY,
                            marginBottom: '8px',
                          }}
                        >
                          Date of birth
                        </Typography>
                        {dobPicker}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: TEXT_SECONDARY,
                            marginBottom: '8px',
                          }}
                        >
                          State of residence
                        </Typography>
                        {statePicker}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ lineHeight: 1.5, color: AMBER_TEXT_AA, display: 'block', mt: 1 }}>
                      <Warning sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5, color: AMBER_TEXT_AA }} />
                      <strong>Legal notice:</strong> Falsely declaring your age or residency is a criminal offence. If a prize winner is found to be under 18 or not a legal U.S. resident, their winnings will be immediately cancelled.
                    </Typography>
                    {dobError && (
                      <motion.div variants={popIn}>
                        <Alert severity="error" sx={{ mt: 1.5 }}>
                          {dobError}
                        </Alert>
                      </motion.div>
                    )}
                  </Box>
                </motion.div>

                {/* Gender */}
                <motion.div variants={popIn}>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: TEXT_SECONDARY,
                        marginBottom: '11px',
                      }}
                    >
                      Gender
                    </Typography>
                    {genderCards}
                  </Box>
                </motion.div>

                {/* Action Row - no back button, this step is a gate */}
                <motion.div variants={popIn}>
                  <Stack direction="row" spacing={2} sx={{ mt: '2px' }}>
                    <AttractButton
                      fullWidth
                      onClick={handleSubmit}
                      disabled={mutation.isPending}
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
        background: BG_PAGE,
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

            {/* Date of Birth */}
            <motion.div variants={popIn}>
              <Box>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: TEXT_SECONDARY,
                    marginBottom: '8px',
                  }}
                >
                  Date of birth
                </Typography>
                {dobPicker}
                {dobError && (
                  <motion.div variants={popIn}>
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                      {dobError}
                    </Alert>
                  </motion.div>
                )}
              </Box>
            </motion.div>

            {/* State of residence */}
            <motion.div variants={popIn}>
              <Box>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: TEXT_SECONDARY,
                    marginBottom: '8px',
                  }}
                >
                  State of residence
                </Typography>
                {statePicker}
                <Typography variant="caption" sx={{ lineHeight: 1.5, color: AMBER_TEXT_AA, display: 'block', mt: 1 }}>
                  <Warning sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.5 }} />
                  <strong>Legal notice:</strong> Falsely declaring your age or residency is a criminal offence. If a prize winner is found to be under 18 or not a legal U.S. resident, their winnings will be immediately cancelled.
                </Typography>
              </Box>
            </motion.div>

            {/* Gender */}
            <motion.div variants={popIn}>
              <Box>
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: TEXT_SECONDARY,
                    marginBottom: '10px',
                  }}
                >
                  Gender
                </Typography>
                {genderCards}
              </Box>
            </motion.div>
          </Stack>
        </motion.div>
      </Box>

      {/* CTA - pinned near bottom */}
      <Box sx={{ padding: '24px 22px', flexShrink: 0 }}>
        <motion.div variants={popIn}>
          <AttractButton
            fullWidth
            onClick={handleSubmit}
            disabled={mutation.isPending}
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
    </Box>
  );
};

export default ProfileSetupPage;
