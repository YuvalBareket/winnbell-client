import {
  Box, Button, Typography, Stack, Divider, Skeleton,
  IconButton, CircularProgress, FormControlLabel, Checkbox, Alert,
} from '@mui/material';
import { Remove, Add, CreditCard, InfoOutlined } from '@mui/icons-material';
import { TIER_MAP, TIER_KEYS, MAX_TIER } from './subscribeTiers';

interface Props {
  selectedTier: number;
  setSelectedTier: (t: number) => void;
  billingInterval: 'monthly' | 'yearly';
  setBillingInterval: (i: 'monthly' | 'yearly') => void;
  locationCount: number | null;
  loading: boolean;
  error: string;
  joinsNextCampaign?: boolean;
  nextCampaignDate?: string | null;
  onSubscribe: () => void;
  onSkip: () => void;
}

const SubscribeStep3 = ({
  selectedTier,
  setSelectedTier,
  billingInterval,
  setBillingInterval,
  locationCount,
  loading,
  error,
  joinsNextCampaign,
  nextCampaignDate,
  onSubscribe,
  onSkip,
}: Props) => {
  const pricePerLocation = TIER_MAP[selectedTier] ?? 0;
  const effectiveLocationCount = locationCount || 1;
  const yearlyPricePerLocation = pricePerLocation * 12;
  const totalMonthly = pricePerLocation * effectiveLocationCount;
  const totalYearly = yearlyPricePerLocation * effectiveLocationCount;
  const currentIndex = TIER_KEYS.indexOf(selectedTier);
  const atMin = currentIndex === 0;
  const atMax = currentIndex === TIER_KEYS.length - 1;

  return (
    <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>

      {/* Billing toggle */}
      <Stack direction='row' alignItems='center' justifyContent='center' sx={{ bgcolor: 'action.hover', borderRadius: 2.5, p: 0.5, mb: 4 }}>
        {(['monthly', 'yearly'] as const).map((interval) => (
          <Box key={interval} onClick={() => setBillingInterval(interval)}
            sx={{
              flex: 1, textAlign: 'center', py: 1, px: 2, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
              bgcolor: billingInterval === interval ? 'background.paper' : 'transparent',
              boxShadow: billingInterval === interval ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Typography variant='body2' fontWeight={700} color={billingInterval === interval ? 'text.primary' : 'text.secondary'} sx={{ textTransform: 'capitalize' }}>
              {interval}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Entries stepper */}
      <Typography variant='h6' fontWeight={700} mb={0.5}>How many entries per location?</Typography>
      <Typography variant='caption' color='text.secondary' display='block' mb={3}>per month</Typography>

      <Stack direction='row' alignItems='center' justifyContent='center' spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex - 1])} disabled={atMin}
          sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMin ? 0.4 : 1 }}>
          <Remove />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' fontWeight={900} sx={{ minWidth: { xs: 160, md: 200 } }}>
            {selectedTier.toLocaleString()} entries
          </Typography>
          <Typography variant='body2' color='text.secondary' mt={1}>
            ${pricePerLocation.toLocaleString()} per location / month
          </Typography>
        </Box>
        <IconButton onClick={() => setSelectedTier(TIER_KEYS[currentIndex + 1])} disabled={atMax}
          sx={{ width: 52, height: 52, border: '2px solid', borderColor: 'divider', borderRadius: 2, opacity: atMax ? 0.4 : 1 }}>
          <Add />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Price breakdown */}
      <Box sx={{ bgcolor: 'rgba(25,93,230,0.06)', borderRadius: 2.5, p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='body2' color='text.secondary'>Entries per location</Typography>
            <Typography variant='body2' fontWeight={700}>{selectedTier.toLocaleString()} / mo</Typography>
          </Stack>
          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='body2' color='text.secondary'>Your locations</Typography>
            {locationCount === null ? <Skeleton width={40} height={20} /> : <Typography variant='body2' fontWeight={700}>{effectiveLocationCount}</Typography>}
          </Stack>
          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='body2' color='text.secondary'>Price per location</Typography>
            <Typography variant='body2' fontWeight={700}>
              {billingInterval === 'yearly' ? `$${yearlyPricePerLocation.toLocaleString()}/yr` : `$${pricePerLocation.toLocaleString()}`}
            </Typography>
          </Stack>
          <Divider />
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' fontWeight={700}>{billingInterval === 'yearly' ? 'Total per year' : 'Total per month'}</Typography>
            <Typography variant='h5' fontWeight={900} sx={{ background: 'linear-gradient(135deg, #195DE2 0%, #7FA6FF 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {billingInterval === 'yearly' ? `$${totalYearly.toFixed(0)}` : `$${totalMonthly.toFixed(0)}`}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {atMax && (
        <Typography variant='body2' textAlign='center' sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
          Need more than {MAX_TIER.toLocaleString()} entries?{' '}
          <Typography component='span' variant='body2' sx={{ color: 'primary.main', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => { window.location.href = 'mailto:support@winnbell.com'; }}>
            Contact us
          </Typography>{' '}for a custom plan.
        </Typography>
      )}

      {joinsNextCampaign && nextCampaignDate && (
        <Alert
          icon={<InfoOutlined fontSize='small' />}
          severity='info'
          sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem', alignItems: 'flex-start' }}
        >
          You're signing up close to the end of this campaign. You'll be joining the campaign that starts on <strong>{nextCampaignDate}</strong> — your subscription begins immediately and your locations will appear on the map right away.
        </Alert>
      )}

      {error && <Typography variant='body2' color='error' textAlign='center' mb={2}>{error}</Typography>}

      <FormControlLabel
        sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
        control={<Checkbox defaultChecked size='small' sx={{ pt: 0 }} />}
        label={
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.5 }}>
            Automatically renew for next campaign - cancel anytime before the 7-day cutoff
          </Typography>
        }
      />

      <Button fullWidth variant='contained' size='large' startIcon={loading ? undefined : <CreditCard />} onClick={onSubscribe} disabled={loading}
        sx={{ py: 1.875, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: '0 4px 14px rgba(25,93,230,0.35)', '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.45)' } }}>
        {loading ? <CircularProgress size={24} color='inherit' /> : 'Start Campaign'}
      </Button>

      <Typography variant='caption' color='text.disabled' textAlign='center' display='block' mt={1.5}>
        {billingInterval === 'yearly'
          ? "You'll be redirected to Stripe's secure checkout. Yearly plan covers 12 monthly campaigns."
          : "You'll be redirected to Stripe's secure checkout. You'll be enrolled in the next monthly campaign on payment."}
      </Typography>

      <Button fullWidth variant='text' size='small' onClick={onSkip}
        sx={{ mt: 1.5, color: 'text.disabled', fontWeight: 600, textTransform: 'none' }}>
        I'll do it later
      </Button>
    </Box>
  );
};

export default SubscribeStep3;
