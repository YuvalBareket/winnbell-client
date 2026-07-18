import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Button, Typography,
  Stack, Alert, Drawer, TextField, Select, MenuItem, useMediaQuery, useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import AttractButton from '../../../shared/components/AttractButton';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { motion } from 'framer-motion';
import { Female, Male, Transgender, MoreHoriz, CheckCircle } from '@mui/icons-material';
import { popIn } from '../../../shared/motion';
import { api } from '../../../shared/api/client';
import { US_STATES } from '../../../shared/constants/usStates';
import {
  TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT, PRIMARY_MAIN, ERROR_MAIN, BG_SURFACE,
  ALPHA_PRIMARY_06, ALPHA_PRIMARY_10, GRADIENT_CTA, SHADOW_CARD,
} from '../../../shared/colors';

const GENDERS = ['Female', 'Male', 'Other', 'Prefer not to say'] as const;
type Gender = typeof GENDERS[number];

const GENDER_ICONS: Record<Gender, typeof Female> = {
  'Female': Female,
  'Male': Male,
  'Other': Transgender,
  'Prefer not to say': MoreHoriz,
};

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { fullName: string; dateOfBirth: string | null; gender: string | null; state: string | null }) => Promise<void>;
  currentFullName: string;
  currentDateOfBirth: string | null;
  currentGender: string | null;
  currentState: string | null;
  // Whether to collect date of birth + gender. Consumers/managers yes; owners/admins name-only.
  showProfileFields: boolean;
  loading?: boolean;
}

const ProfileEditDialog = ({
  open,
  onClose,
  onSave,
  currentFullName,
  currentDateOfBirth,
  currentGender,
  currentState,
  showProfileFields,
  loading = false,
}: ProfileEditDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [fullName, setFullName] = useState(currentFullName ?? '');
  const [dob, setDob] = useState<Dayjs | null>(currentDateOfBirth ? dayjs(currentDateOfBirth) : null);
  const [gender, setGender] = useState<Gender | ''>(currentGender as Gender || '');
  const [stateCode, setStateCode] = useState(currentState ?? '');
  const [error, setError] = useState('');

  // Re-seed the fields from the CURRENT user every time the dialog opens. The dialog
  // stays mounted across account switches and profile saves, so the useState
  // initializers alone would show a previous session's values.
  useEffect(() => {
    if (!open) return;
    setFullName(currentFullName ?? '');
    setDob(currentDateOfBirth ? dayjs(currentDateOfBirth) : null);
    setGender(currentGender as Gender || '');
    setStateCode(currentState ?? '');
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // States where Winnbell operates; empty list = no restriction (offer all).
  const { data: regionConfig } = useQuery({
    queryKey: ['auth', 'region-config'],
    queryFn: async () => (await api.get<{ allowed_states: string[] }>('/auth/region-config')).data,
    staleTime: 10 * 60_000,
    enabled: showProfileFields,
  });
  const allowedCodes = regionConfig?.allowed_states ?? [];
  const stateOptions = allowedCodes.length > 0
    ? US_STATES.filter((s) => allowedCodes.includes(s.code) || s.code === stateCode)
    : US_STATES;

  // Client-side 18+ validation
  const dobError = dob !== null && dob.isValid() && dayjs().diff(dob, 'year') < 18
    ? 'You must be 18 or older.'
    : '';

  const handleSave = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (showProfileFields) {
      if (!dob || !dob.isValid()) {
        setError('Please enter your date of birth.');
        return;
      }
      if (dobError) {
        return;
      }
      if (!gender) {
        setError('Please select a gender.');
        return;
      }
      if (!stateCode) {
        setError('Please select your state.');
        return;
      }
    }

    try {
      await onSave({
        fullName: fullName.trim(),
        dateOfBirth: showProfileFields && dob ? dob.format('YYYY-MM-DD') : null,
        gender: showProfileFields ? gender : null,
        state: showProfileFields ? stateCode : null,
      });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to save profile. Please try again.';
      setError(msg);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFullName(currentFullName ?? '');
      setDob(currentDateOfBirth ? dayjs(currentDateOfBirth) : null);
      setGender(currentGender as Gender || '');
      setStateCode(currentState ?? '');
      setError('');
      onClose();
    }
  };

  // Gender cards
  const genderCards = (
    <Stack spacing={1}>
      {GENDERS.map((g) => {
        const selected = gender === g;
        const Icon = GENDER_ICONS[g];
        return (
          <motion.button
            key={g}
            variants={popIn}
            whileTap={{ scale: 0.96 }}
            onClick={() => setGender(g)}
            disabled={loading}
            style={{
              width: '100%',
              border: selected ? `1.5px solid ${PRIMARY_MAIN}` : `1px solid ${BORDER_LIGHT}`,
              background: selected ? ALPHA_PRIMARY_06 : BG_SURFACE,
              borderRadius: '12px',
              padding: '14px 14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
              boxShadow: selected ? `0 0 0 3px ${ALPHA_PRIMARY_10}` : 'none',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: selected ? 700 : 600,
              color: TEXT_HEADING,
              textAlign: 'left',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
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
              <Icon sx={{ fontSize: 18 }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{g}</span>
            {selected && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexShrink: 0 }}
              >
                <CheckCircle sx={{ fontSize: 18, color: PRIMARY_MAIN }} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </Stack>
  );

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {error && <Alert severity='error'>{error}</Alert>}

      {/* Full name */}
      <Box>
        <Typography
          sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_SECONDARY, marginBottom: '10px' }}
        >
          Full name
        </Typography>
        <TextField
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder='Your name'
          fullWidth
          disabled={loading}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: BG_SURFACE,
              borderRadius: '12px',
              fontSize: '14.5px',
              fontWeight: 600,
              color: TEXT_HEADING,
              '& fieldset': { borderColor: BORDER_LIGHT, borderWidth: '1px' },
              '&:hover fieldset': { borderColor: BORDER_LIGHT },
              '&.Mui-focused fieldset': { borderColor: PRIMARY_MAIN, borderWidth: '1.5px' },
              '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
            },
          }}
        />
      </Box>

      {/* Date of Birth */}
      {showProfileFields && (
      <Box>
        <Typography
          sx={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_SECONDARY,
            marginBottom: '10px',
          }}
        >
          Date of birth
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            openTo='year'
            views={['year', 'month', 'day']}
            value={dob}
            onChange={(value) => setDob(value)}
            maxDate={dayjs().subtract(18, 'year')}
            minDate={dayjs().subtract(120, 'year')}
            disabled={loading}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: {
                  '& .MuiPickersOutlinedInput-root': {
                    bgcolor: BG_SURFACE,
                    borderRadius: '12px',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    color: TEXT_HEADING,
                    '& .MuiPickersOutlinedInput-notchedOutline': {
                      borderColor: BORDER_LIGHT,
                      borderWidth: '1px',
                    },
                    '&:hover .MuiPickersOutlinedInput-notchedOutline': { borderColor: BORDER_LIGHT },
                    '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                      borderColor: PRIMARY_MAIN,
                      borderWidth: '1.5px',
                    },
                    '&.Mui-focused': { boxShadow: `0 0 0 3px ${ALPHA_PRIMARY_10}` },
                    '&.Mui-disabled': { opacity: 0.6 },
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
        {dobError && (
          <Typography variant='caption' sx={{ color: ERROR_MAIN, display: 'block', mt: 1 }}>
            {dobError}
          </Typography>
        )}
      </Box>
      )}

      {/* State of residence - only states where Winnbell operates */}
      {showProfileFields && (
      <Box>
        <Typography
          sx={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_SECONDARY,
            marginBottom: '10px',
          }}
        >
          State of residence
        </Typography>
        <Select
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          displayEmpty
          fullWidth
          disabled={loading}
          renderValue={(code) => {
            if (!code) return <Box component='span' sx={{ color: TEXT_SECONDARY }}>Select your state</Box>;
            return US_STATES.find((s) => s.code === code)?.name ?? code;
          }}
          MenuProps={{ PaperProps: { sx: { maxHeight: 320, borderRadius: '12px' } } }}
          sx={{
            bgcolor: BG_SURFACE,
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
      </Box>
      )}

      {/* Gender */}
      {showProfileFields && (
      <Box>
        <Typography
          sx={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: TEXT_SECONDARY,
            marginBottom: '10px',
          }}
        >
          Gender
        </Typography>
        {genderCards}
      </Box>
      )}
    </Box>
  );

  // Desktop: Dialog
  if (!isMobile) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: SHADOW_CARD },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: TEXT_HEADING }}>
          Edit profile
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {content}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant='outlined'
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <AttractButton
            onClick={handleSave}
            variant='contained'
            disabled={loading || dobError !== ''}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              transition: 'all 0.3s',
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </AttractButton>
        </DialogActions>
      </Dialog>
    );
  }

  // Mobile: Bottom sheet drawer
  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor='bottom'
      PaperProps={{
        sx: {
          borderRadius: '24px 24px 0 0',
          maxHeight: '90vh',
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: TEXT_HEADING }}>
          Edit profile
        </Typography>
        {content}
        <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
          <Button
            onClick={handleClose}
            variant='outlined'
            fullWidth
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <AttractButton
            onClick={handleSave}
            variant='contained'
            fullWidth
            disabled={loading || dobError !== ''}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              transition: 'all 0.3s',
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </AttractButton>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default ProfileEditDialog;
