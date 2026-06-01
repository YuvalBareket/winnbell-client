import { Box, Typography, Button, Container } from '@mui/material';
import { ConfirmationNumber, ArrowForward } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

interface FinalCTAProps {
  onNavigate: (path: string) => void;
}

const FinalCTA = ({ onNavigate }: FinalCTAProps) => {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth='sm'>
        <ConfirmationNumber sx={{ fontSize: { xs: 40, md: 48 }, color: PRIMARY_MAIN, opacity: 0.8, mb: { xs: 1.5, md: 2 } }} />
        <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.6rem', md: '2.4rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 1.5, md: 2 } }}>
          Ready to start winning?
        </Typography>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6, mb: { xs: 3.5, md: 5 }, maxWidth: 380, mx: 'auto' }}>
          Sign up free, claim your weekly entry, and compete for real monthly cash prizes. No purchase necessary - ever.
        </Typography>
        <Button
          variant='contained'
          size='large'
          endIcon={<ArrowForward />}
          onClick={() => onNavigate('/register')}
          sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.05rem' }, borderRadius: 2.5, px: { xs: 2.5, md: 5 }, py: { xs: 1.3, md: 1.6 }, width: { xs: '100%', md: 'auto' }, boxShadow: '0 8px 24px rgba(25,93,230,0.3)', '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' } }}
        >
          Create free account
        </Button>
      </Container>
    </Box>
  );
};

export default FinalCTA;
