import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ConfirmationNumber, ArrowForward } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

interface FinalCTAProps {
  onNavigate: (path: string) => void;
  onScrollToBusinesses: () => void;
}

const FinalCTA = ({ onNavigate, onScrollToBusinesses }: FinalCTAProps) => {
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth='sm'>
        <ConfirmationNumber sx={{ fontSize: 48, color: PRIMARY_MAIN, opacity: 0.8, mb: 2 }} />
        <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.4rem' }, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2 }}>
          Ready to start winning?
        </Typography>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', lineHeight: 1.65, mb: 5, maxWidth: 380, mx: 'auto' }}>
          Join thousands of people who turn everyday shopping into prizes.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' alignItems='center'>
          <Button
            variant='contained'
            size='large'
            endIcon={<ArrowForward />}
            onClick={() => onNavigate('/register')}
            sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
          >
            Create free account
          </Button>
          <Button
            variant='outlined'
            size='large'
            endIcon={<ArrowForward />}
            onClick={onScrollToBusinesses}
            sx={{ fontWeight: 700, fontSize: '1.05rem', borderRadius: 2.5, px: 5, py: 1.6, borderColor: PRIMARY_MAIN, color: PRIMARY_MAIN, '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: 'rgba(25,93,230,0.05)' } }}
          >
            Partner with us
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default FinalCTA;
