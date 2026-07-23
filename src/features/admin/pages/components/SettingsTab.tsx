import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { WorkspacePremium } from '@mui/icons-material';
import { usePlatformSettings, useSavePlatformSettings } from '../../hooks/useAdmin';
import { US_STATES } from '../../../../shared/constants/usStates';
import { AMBER_HOURGLASS } from '../../../../shared/colors';
import { useFoundingAvailability } from '../../../subscription/hooks/useFoundingAvailability';

const SettingsTab: React.FC = () => {
  const { data: platformSettings } = usePlatformSettings();
  const { data: foundingAvailability } = useFoundingAvailability();
  const saveMutation = useSavePlatformSettings();

  const [localAllowedStates, setLocalAllowedStates] = useState<string[]>([]);
  const [stateInputValue, setStateInputValue] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Founding partner state
  const [foundingCap, setFoundingCap] = useState<number>(30);
  const [foundingActive, setFoundingActive] = useState<boolean>(true);
  const [foundingCapError, setFoundingCapError] = useState('');

  // Seed the form ONCE from the first server payload. Without the guard, any background
  // refetch of platformSettings re-fired this and silently wiped unsaved admin edits mid-typing.
  const didInitForm = useRef(false);
  useEffect(() => {
    if (platformSettings && !didInitForm.current) {
      didInitForm.current = true;
      setLocalAllowedStates(platformSettings.allowed_states ?? []);
      setFoundingCap(platformSettings.founding_member_cap ?? 30);
      setFoundingActive(platformSettings.founding_phase_active ?? true);
    }
  }, [platformSettings]);

  const handleSave = () => {
    setFoundingCapError('');

    const taken = foundingAvailability?.taken ?? 0;
    if (foundingCap < taken) {
      setFoundingCapError(`Cap cannot be lower than the current number of founding members (${taken}).`);
      return;
    }

    saveMutation.mutate(
      {
        global_entry_cap: null,
        allowed_states: localAllowedStates,
        founding_member_cap: foundingCap,
        founding_phase_active: foundingActive,
      },
      { onSuccess: () => setSettingsSaved(true) },
    );
  };

  return (
    <Stack spacing={3}>
      {/* ── Allowed States ────────────────────────────────────────────────────── */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={700} mb={0.5}>Allowed States</Typography>
              <Typography variant='body2' color='text.secondary' mb={2}>
                Restrict registration to specific US states. When any state is selected, sign-ups from outside the US are blocked too. Remove all to allow sign-ups from anywhere.
              </Typography>

              <Autocomplete
                options={US_STATES}
                getOptionLabel={(o) => o.name}
                value={null}
                inputValue={stateInputValue}
                onInputChange={(_e, val) => setStateInputValue(val)}
                onChange={(_e, selected) => {
                  if (selected && !localAllowedStates.includes(selected.code)) {
                    setLocalAllowedStates((prev) => [...prev, selected.code]);
                  }
                  setStateInputValue('');
                }}
                renderInput={(params) => (
                  <TextField {...params} size='small' placeholder='Search state…' sx={{ width: 300 }} />
                )}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                {localAllowedStates.length === 0 ? (
                  <Typography variant='caption' color='text.secondary'>No restriction (open everywhere)</Typography>
                ) : (
                  localAllowedStates.map((code) => {
                    const state = US_STATES.find((s) => s.code === code);
                    return (
                      <Chip
                        key={code}
                        label={state?.name ?? code}
                        size='small'
                        onDelete={() => setLocalAllowedStates((prev) => prev.filter((x) => x !== code))}
                      />
                    );
                  })
                )}
              </Box>

              {localAllowedStates.length > 0 && (
                <Button
                  size='small' color='error' variant='outlined'
                  onClick={() => {
                    setLocalAllowedStates([]);
                    saveMutation.mutate(
                      { global_entry_cap: null, allowed_states: [], founding_member_cap: foundingCap, founding_phase_active: foundingActive },
                      { onSuccess: () => setSettingsSaved(true) },
                    );
                  }}
                  disabled={saveMutation.isPending}
                  sx={{ mt: 1.5, fontWeight: 600 }}
                >
                  Open to everyone
                </Button>
              )}
            </Box>

            <Divider />

            {/* ── Founding Partner Program ──────────────────────────────────── */}
            <Box>
              <Stack direction='row' alignItems='center' spacing={1} mb={0.5}>
                <WorkspacePremium sx={{ color: AMBER_HOURGLASS, fontSize: 20 }} />
                <Typography variant='h6' fontWeight={700}>Founding Partner Program</Typography>
              </Stack>
              <Typography variant='body2' color='text.secondary' mb={2.5}>
                Control the early-bird founding partner offer. When active, businesses pay a one-time fee per location for the full founding term instead of a recurring subscription.
              </Typography>

              <Stack spacing={2.5}>
                {/* Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={foundingActive}
                      onChange={(e) => setFoundingActive(e.target.checked)}
                      color='primary'
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body2' fontWeight={700}>
                        {foundingActive ? 'Program is active' : 'Program is inactive'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {foundingActive
                          ? 'Businesses see the founding partner checkout flow'
                          : 'Subscribe page will show "not currently active"'}
                      </Typography>
                    </Box>
                  }
                />

                {/* Cap input */}
                <Stack direction='row' alignItems='flex-start' spacing={2}>
                  <TextField
                    label='Max founding partners'
                    type='number'
                    size='small'
                    value={foundingCap}
                    onChange={(e) => {
                      setFoundingCap(Number(e.target.value));
                      setFoundingCapError('');
                    }}
                    inputProps={{ min: 1, step: 1 }}
                    error={!!foundingCapError}
                    helperText={foundingCapError || 'Minimum: current number of paid members'}
                    sx={{ width: 220 }}
                  />

                  {/* Live stats */}
                  {foundingAvailability && (
                    <Box sx={{ pt: 0.5 }}>
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Spots taken
                      </Typography>
                      <Typography variant='body1' fontWeight={800}>
                        {foundingAvailability.taken}
                        <Typography component='span' variant='body2' color='text.secondary' fontWeight={400}>
                          {' '}/ {foundingAvailability.cap} · {foundingAvailability.remaining} remaining
                        </Typography>
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {settingsSaved && (
              <Alert severity='success' onClose={() => setSettingsSaved(false)}>
                Settings saved successfully.
              </Alert>
            )}

            <Box>
              <Button
                variant='contained' disableElevation
                onClick={handleSave}
                disabled={saveMutation.isPending}
                sx={{ fontWeight: 700 }}
              >
                {saveMutation.isPending ? <CircularProgress size={20} color='inherit' /> : 'Save Settings'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default SettingsTab;
