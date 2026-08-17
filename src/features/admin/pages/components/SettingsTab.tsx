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
import { WorkspacePremium, ConfirmationNumberOutlined } from '@mui/icons-material';
import { usePlatformSettings, useSavePlatformSettings } from '../../hooks/useAdmin';
import { US_STATES } from '../../../../shared/constants/usStates';
import {
  AMBER_HOURGLASS, BORDER_LIGHT, BG_ROW_SUBTLE,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, PRIMARY_TINT, PRIMARY_MAIN,
  GRADIENT_CTA, SHADOW_PRIMARY_SOFT,
} from '../../../../shared/colors';
import { riseIn, staggerContainer } from '../../../../shared/motion';
import { AdminCard, AdminCardSkeleton, SectionHeader } from './adminUi';
import { useFoundingAvailability } from '../../../subscription/hooks/useFoundingAvailability';

const SettingsTab: React.FC = () => {
  const { data: platformSettings, isLoading: settingsLoading } = usePlatformSettings();
  const { data: foundingAvailability } = useFoundingAvailability();
  const saveMutation = useSavePlatformSettings();

  const [localAllowedStates, setLocalAllowedStates] = useState<string[]>([]);
  const [stateInputValue, setStateInputValue] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Founding partner state
  const [foundingCap, setFoundingCap] = useState<number>(30);
  const [foundingActive, setFoundingActive] = useState<boolean>(true);
  const [foundingCapError, setFoundingCapError] = useState('');

  // Global entry cap: the per-location cap for businesses WITHOUT a plan (manual/free
  // campaign adds). Kept as a string so the field can be cleared; '' = no cap (NULL).
  const [globalEntryCap, setGlobalEntryCap] = useState<string>('');
  const [entryCapError, setEntryCapError] = useState('');

  // '' -> null (no cap); otherwise must be a positive whole number.
  const parseEntryCap = (): { ok: boolean; value: number | null } => {
    const trimmed = globalEntryCap.trim();
    if (trimmed === '') return { ok: true, value: null };
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < 1) return { ok: false, value: null };
    return { ok: true, value: n };
  };

  // Seed the form ONCE from the first server payload. Without the guard, any background
  // refetch of platformSettings re-fired this and silently wiped unsaved admin edits mid-typing.
  const didInitForm = useRef(false);
  useEffect(() => {
    if (platformSettings && !didInitForm.current) {
      didInitForm.current = true;
      setLocalAllowedStates(platformSettings.allowed_states ?? []);
      setFoundingCap(platformSettings.founding_member_cap ?? 30);
      setFoundingActive(platformSettings.founding_phase_active ?? true);
      setGlobalEntryCap(platformSettings.global_entry_cap != null ? String(platformSettings.global_entry_cap) : '');
    }
  }, [platformSettings]);

  const handleSave = () => {
    setFoundingCapError('');
    setEntryCapError('');

    const taken = foundingAvailability?.taken ?? 0;
    if (foundingCap < taken) {
      setFoundingCapError(`Cap cannot be lower than the current number of founding members (${taken}).`);
      return;
    }

    const cap = parseEntryCap();
    if (!cap.ok) {
      setEntryCapError('Must be a positive whole number, or empty for no cap.');
      return;
    }

    saveMutation.mutate(
      {
        global_entry_cap: cap.value,
        allowed_states: localAllowedStates,
        founding_member_cap: foundingCap,
        founding_phase_active: foundingActive,
      },
      { onSuccess: () => setSettingsSaved(true) },
    );
  };

  // Skeleton the two settings cards while the payload loads - otherwise the form
  // renders empty defaults and the real values jump in mid-view.
  if (settingsLoading) {
    return (
      <Stack spacing={3}>
        <AdminCardSkeleton height={240} />
        <AdminCardSkeleton height={280} />
      </Stack>
    );
  }

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
                  In production, sign-ups are always US-only. Select states to restrict
                  registration further; remove all to allow every US state.
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
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>All US states allowed (US-only always applies)</Typography>
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
                      // Preserve the entry cap on this inline save - hardcoding null here
                      // silently WIPED a configured cap (the bug this field's addition fixed).
                      const cap = parseEntryCap();
                      saveMutation.mutate(
                        { global_entry_cap: cap.ok ? cap.value : null, allowed_states: [], founding_member_cap: foundingCap, founding_phase_active: foundingActive },
                        { onSuccess: () => setSettingsSaved(true) },
                      );
                    }}
                    disabled={saveMutation.isPending}
                    sx={{ mt: 1.5, fontWeight: 600 }}
                  >
                    Open to all US states
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

        {/* ── Entry Cap (businesses without a plan) ─────────────────────── */}
        <motion.div variants={riseIn}>
          <AdminCard>
            <Box sx={{ p: 2.25 }}>
              <SectionHeader
                icon={<ConfirmationNumberOutlined />}
                tint={PRIMARY_TINT}
                color={PRIMARY_MAIN}
                title='Entry Cap'
              />
              <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mb: 2 }}>
                Per-location entry cap for businesses that are in a campaign without a paid plan
                (added manually, e.g. a free trial). Businesses on a plan always use their plan&apos;s
                own cap instead. Leave empty for no cap.
              </Typography>
              <TextField
                label='Entries per location'
                type='number'
                size='small'
                value={globalEntryCap}
                onChange={(e) => { setGlobalEntryCap(e.target.value); setEntryCapError(''); }}
                inputProps={{ min: 1, step: 1 }}
                error={!!entryCapError}
                helperText={entryCapError || (globalEntryCap.trim() === '' ? 'Currently: no cap (unlimited)' : `Currently: ${globalEntryCap} entries per location`)}
                placeholder='e.g. 1000'
                sx={{
                  width: 220,
                  '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: BORDER_LIGHT },
                }}
              />
            </Box>
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
