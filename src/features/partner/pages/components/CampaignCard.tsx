import {
  Paper, Box, Typography, Stack, Chip, IconButton, TextField, Button, CircularProgress, Divider,
} from '@mui/material';
import { ReceiptLong, Edit } from '@mui/icons-material';
import { ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { BusinessData } from '../../types/business.types';

interface CampaignCardProps {
  business: BusinessData;
  editingTerms: boolean;
  setEditingTerms: (value: boolean) => void;
  termsValue: string;
  setTermsValue: (value: string) => void;
  updateBusiness: (data: { businessSector: string; description: string; terms_text: string }, options?: any) => void;
  isUpdatingTerms: boolean;
}

const CampaignCard = ({
  business,
  editingTerms,
  setEditingTerms,
  termsValue,
  setTermsValue,
  updateBusiness,
  isUpdatingTerms,
}: CampaignCardProps) => {
  const navigate = useNavigate();

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* Plan row */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={1.5} mb={2}>
        <Stack direction='row' alignItems='center' gap={2}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: 2,
              bgcolor: business.subscription_status === 'Active' ? 'primary.main' : 'action.disabledBackground',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <ReceiptLong sx={{ color: business.subscription_status === 'Active' ? 'white' : 'text.disabled', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Campaign
            </Typography>
            <Typography variant='body1' fontWeight={700}>
              {business.subscription_status ? 'Winnbell Partner Plan' : 'No active plan'}
            </Typography>
            {business.current_period_end && (
              <Typography variant='caption' color='text.secondary'>
                {business.cancel_at_period_end
                  ? `Cancels on ${new Date(business.current_period_end).toLocaleDateString()}`
                  : `Renews ${new Date(business.current_period_end).toLocaleDateString()}`}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1}>
          <Chip
            label={business.subscription_status ?? 'Inactive'}
            size='small'
            sx={{
              fontWeight: 700,
              bgcolor: business.subscription_status === 'Active'
                ? 'rgba(46,125,50,0.1)'
                : business.subscription_status === 'Past_Due'
                ? 'rgba(237,108,2,0.1)'
                : 'action.hover',
              color: business.subscription_status === 'Active'
                ? 'success.main'
                : business.subscription_status === 'Past_Due'
                ? 'warning.main'
                : 'text.secondary',
            }}
          />
          {business.subscription_status && (
            <IconButton size='small' onClick={() => navigate('/subscription/manage')}>
              <ChevronRight fontSize='small' />
            </IconButton>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Campaign terms */}
      <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          How customers earn tickets
        </Typography>
        {!editingTerms && (
          <IconButton
            size='small'
            onClick={() => { setTermsValue(business.terms_text); setEditingTerms(true); }}
          >
            <Edit fontSize='small' />
          </IconButton>
        )}
      </Stack>

      {editingTerms ? (
        <Stack spacing={1.5}>
          <TextField
            value={termsValue}
            onChange={(e) => setTermsValue(e.target.value)}
            multiline
            rows={2}
            fullWidth
            placeholder='e.g. "Spend $20 or more to receive a ticket"'
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
          />
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            <Button
              size='small'
              onClick={() => setEditingTerms(false)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              size='small'
              variant='contained'
              disabled={isUpdatingTerms}
              onClick={() => {
                updateBusiness(
                  { businessSector: business.sector, description: business.description, terms_text: termsValue },
                  { onSuccess: () => setEditingTerms(false) },
                );
              }}
              sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
            >
              {isUpdatingTerms ? <CircularProgress size={16} color='inherit' /> : 'Save'}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography
          variant='body2'
          color={business.terms_text ? 'text.secondary' : 'text.disabled'}
          sx={{ lineHeight: 1.6, fontStyle: business.terms_text ? 'normal' : 'italic' }}
        >
          {business.terms_text || 'No campaign terms set yet. Tap the edit icon to add.'}
        </Typography>
      )}
    </Paper>
  );
};

export default CampaignCard;
