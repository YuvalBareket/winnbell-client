import {
  Box, Button, Typography, Stack, TextField, InputAdornment, CircularProgress,
} from '@mui/material';

interface Props {
  thresholdInput: string;
  setThresholdInput: (v: string) => void;
  isThresholdValid: boolean;
  parsedThreshold: number | null;
  savingThreshold: boolean;
  onContinue: () => void;
  onSkip: () => void;
}

const SubscribeStep1 = ({
  thresholdInput,
  setThresholdInput,
  isThresholdValid,
  parsedThreshold,
  savingThreshold,
  onContinue,
  onSkip,
}: Props) => (
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
          {[parsedThreshold - 1, parsedThreshold, parsedThreshold * 2].map((amt) => {
            const entries = Math.floor(amt / parsedThreshold);
            return (
              <Stack key={amt} direction='row' alignItems='center' spacing={1}>
                <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 80 }}>
                  ${amt.toFixed(2)}
                </Typography>
                <Typography variant='body2' fontWeight={700} sx={{ color: entries > 0 ? 'success.main' : 'text.disabled' }}>
                  {entries > 0 ? `✓ ${entries} ${entries === 1 ? 'entry' : 'entries'}` : '✗ no entry'}
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
      onClick={onContinue}
      disabled={!isThresholdValid || savingThreshold}
      sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 14px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.4)' } }}
    >
      {savingThreshold ? <CircularProgress size={22} color='inherit' /> : 'Continue →'}
    </Button>

    <Button fullWidth variant='text' size='small' onClick={onSkip} sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
      I'll do it later
    </Button>
  </Box>
);

export default SubscribeStep1;
