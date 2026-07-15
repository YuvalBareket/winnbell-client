import { useState } from 'react';
import {
  Box, Typography, Stack, Alert,
  useMediaQuery, useTheme, Grid,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { Warning, Female, Male, Transgender, MoreHoriz, CheckCircle } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { completeProfileSetup } from '../../../store/slices/authSlice';
import AuthBrandPanel from '../components/AuthBrandPanel';
import { api } from '../../../shared/api/client';
import {
  BG_PAGE, BORDER_LIGHT, PRIMARY_MAIN, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10,
  TEXT_SECONDARY, TEXT_TERTIARY, TEXT_HEADING,
  GRADIENT_HERO, GRADIENT_HERO_WARM, GRADIENT_CTA,
  ALPHA_WHITE_15, SHADOW_PRIMARY_MEDIUM,
} from '../../../shared/colors';
import { staggerContainer, popIn, riseIn } from '../../../shared/motion';

const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'] as const;
type Gender = typeof GENDERS[number];

const GENDER_ICONS: Record<Gender, typeof Female> = {
  'Female': Female,
  'Male': Male,
  'Non-binary': Transgender,
  'Prefer not to say': MoreHoriz,
};

interface ProfileSetupRequest {
  dateOfBirth: string;
  gender: string;
}

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const dispatch = useAppDispatch();

  const isBusiness = useAppSelector(selectIsBusiness);
  const isLocationManager = useAppSelector(selectIsLocationManager);

  const [dob, setDob] = useState<Dayjs | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | ''>('');
  const [submitError, setSubmitError] = useState('');

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

    const dateOfBirth = dob.format('YYYY-MM-DD');
    mutation.mutate(
      { dateOfBirth, gender: selectedGender },
      {
        onSuccess: () => {
          dispatch(completeProfileSetup({ dateOfBirth, gender: selectedGender }));
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
              },
            },
          },
        }}
      />
    </LocalizationProvider>
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
          tagline="Two quick details so we can confirm you're eligible and tailor draws to you."
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
              {/* Heading */}
              <motion.div variants={riseIn}>
                <Typography
                  sx={{
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: TEXT_HEADING,
                    marginBottom: '6px',
                  }}
                >
                  Set up your profile
                </Typography>
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

                {/* Date of Birth */}
                <motion.div variants={popIn}>
                  <Box>
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
                    <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'warning.main', display: 'block', mt: 1 }}>
                      <Warning sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
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

                <motion.div variants={popIn}>
                  <Typography align="center" sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, fontWeight: 600 }}>
                    You can edit this later in Settings
                  </Typography>
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

        {/* Brand row: app name only - this step is a gate, there is no going back */}
        <Stack direction="row" alignItems="center" sx={{ position: 'relative' }}>
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
                <Typography variant="caption" sx={{ lineHeight: 1.5, color: 'warning.main', display: 'block', mt: 1 }}>
                  <Warning sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.5 }} />
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
          <Typography align="center" sx={{ fontSize: '12.5px', color: TEXT_TERTIARY, fontWeight: 600, mt: '12px' }}>
            You can edit this later in Settings
          </Typography>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ProfileSetupPage;
