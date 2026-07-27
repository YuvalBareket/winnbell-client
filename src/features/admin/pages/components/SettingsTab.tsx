import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import { WorkspacePremium } from '@mui/icons-material';
import { usePlatformSettings, useSavePlatformSettings } from '../../hooks/useAdmin';
import { US_STATES } from '../../../../shared/constants/usStates';
import {
  AMBER_HOURGLASS, BORDER_LIGHT, BG_ROW_SUBTLE,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, PRIMARY_TINT, PRIMARY_MAIN,
  GRADIENT_CTA, SHADOW_PRIMARY_SOFT,
} from '../../../../shared/colors';
import { riseIn, staggerContainer } from '../../../../shared/motion';
import { AdminCard, SectionHeader } from './adminUi';
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
    <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
      <Stack spacing={3}>
        {/* ── Allowed States ────────────────────────────────────────────────────── */}
        <motion.div variants={riseIn}>
          <AdminCard>
            <Stack spacing={0}>
              <Box sx={{ p: 2.25 }}>
                <SectionHeader
                  icon={<WorkspacePremium />}
                  tint={PRIMARY_TINT}
                  color={PRIMARY_MAIN}
                  title='Allowed States'
                />
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mb: 2 }}>
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
                    <TextField
                      {...params}
                      size='small'
                      placeholder='Search state…'
                      sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT } }}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                  {localAllowedStates.length === 0 ? (
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>No restriction (open everywhere)</Typography>
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
                    size='small'
                    color='error'
                    variant='outlined'
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
            </Stack>
          </AdminCard>
        </motion.div>

        {/* ── Founding Partner Program ──────────────────────────────────── */}
        <motion.div variants={riseIn}>
          <AdminCard>
            <Stack spacing={0}>
              <Box sx={{ p: 2.25 }}>
                  <SectionHeader
                    icon={<WorkspacePremium />}
                    tint={PRIMARY_TINT}
                    color={AMBER_HOURGLASS}
                    title='Founding Partner Program'
                  />
                  <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mb: 2 }}>
                    Control the early-bird founding partner offer. When active, businesses pay a one-time fee per location for the full founding term instead of a recurring subscription.
                  </Typography>

                  <Stack spacing={2.5}>
                    {/* Toggle */}
                    <Box sx={{ p: 1.5, bgcolor: BG_ROW_SUBTLE, borderRadius: '12px' }}>
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
                            <Typography variant='body2' sx={{ fontWeight: 700, color: TEXT_HEADING }}>
                              {foundingActive ? 'Program is active' : 'Program is inactive'}
                            </Typography>
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                              {foundingActive
                                ? 'Businesses see the founding partner checkout flow'
                                : 'Subscribe page will show "not currently active"'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>

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
                        sx={{
                          width: 220,
                          '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT },
                        }}
                      />

                      {/* Live stats */}
                      {foundingAvailability && (
                        <Box sx={{ pt: 0.5 }}>
                          <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block' }}>
                            Spots taken
                          </Typography>
                          <Typography variant='body1' sx={{ fontWeight: 800, color: TEXT_HEADING }}>
                            {foundingAvailability.taken}
                            <Typography component='span' variant='body2' sx={{ color: TEXT_SECONDARY, fontWeight: 400 }}>
                              {' '}/ {foundingAvailability.cap} · {foundingAvailability.remaining} remaining
                            </Typography>
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </AdminCard>
          </motion.div>

        {/* Success Alert */}
        {settingsSaved && (
          <motion.div variants={riseIn}>
            <Alert severity='success' onClose={() => setSettingsSaved(false)}>
              Settings saved successfully.
            </Alert>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div variants={riseIn}>
          <Button
            variant='contained'
            disableElevation
            onClick={handleSave}
            disabled={saveMutation.isPending}
            sx={{
              background: GRADIENT_CTA,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: SHADOW_PRIMARY_SOFT,
              '&:hover': { boxShadow: SHADOW_PRIMARY_SOFT },
            }}
          >
            {saveMutation.isPending ? <CircularProgress size={20} color='inherit' /> : 'Save Settings'}
          </Button>
        </motion.div>
      </Stack>
    </motion.div>
  );
};

export default SettingsTab;
