import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { usePlatformSettings, useSavePlatformSettings } from '../../hooks/useAdmin';
import { COUNTRIES } from '../../../../shared/constants/countries';

const SettingsTab: React.FC = () => {
  const { data: platformSettings } = usePlatformSettings();
  const saveMutation = useSavePlatformSettings();

  const [localAllowedStates, setLocalAllowedStates] = useState<string[]>([]);
  const [countryInputValue, setCountryInputValue] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (platformSettings) {
      setLocalAllowedStates(platformSettings.allowed_states ?? []);
    }
  }, [platformSettings]);

  const handleSave = () => {
    saveMutation.mutate(
      { global_entry_cap: null, allowed_states: localAllowedStates },
      { onSuccess: () => setSettingsSaved(true) },
    );
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={700} mb={0.5}>Allowed Countries</Typography>
              <Typography variant='body2' color='text.secondary' mb={2}>
                Restrict registration to specific countries. Remove all to allow worldwide sign-ups.
              </Typography>

              <Autocomplete
                options={COUNTRIES}
                getOptionLabel={(o) => o.name}
                value={null}
                inputValue={countryInputValue}
                onInputChange={(_e, val) => setCountryInputValue(val)}
                onChange={(_e, selected) => {
                  if (selected && !localAllowedStates.includes(selected.code)) {
                    setLocalAllowedStates((prev) => [...prev, selected.code]);
                  }
                  setCountryInputValue('');
                }}
                renderInput={(params) => (
                  <TextField {...params} size='small' placeholder='Search country…' sx={{ width: 300 }} />
                )}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                {localAllowedStates.length === 0 ? (
                  <Typography variant='caption' color='text.secondary'>Worldwide (no restriction)</Typography>
                ) : (
                  localAllowedStates.map((code) => {
                    const country = COUNTRIES.find((c) => c.code === code);
                    return (
                      <Chip
                        key={code}
                        label={country?.name ?? code}
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
                      { global_entry_cap: null, allowed_states: [] },
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

            {settingsSaved && (
              <Alert severity='success' onClose={() => setSettingsSaved(false)}>Settings saved successfully.</Alert>
            )}

            <Box>
              <Button
                variant='contained'
                disableElevation
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
