import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

interface AudienceSplitProps {
  onNavigate: (path: string) => void;
}

const AudienceSplit = ({ onNavigate }: AudienceSplitProps) => {
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
      <Container maxWidth='lg'>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 3, md: 4 } }}>
          {/* For Shoppers Card */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 12px 32px rgba(2,146,183,0.1)' },
            }}
          >
            <ConfirmationNumber sx={{ fontSize: 40, color: PRIMARY_MAIN, mb: 2.5 }} />
            <Typography variant='h5' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1.5, fontSize: '1.3rem' }}>
              I shop at local businesses
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: 'left' }}>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Earn free entries with every purchase
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Win real prizes monthly
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Completely free to join
              </Typography>
            </Stack>
            <Button
              variant='contained'
              fullWidth
              onClick={() => onNavigate('/register')}
              sx={{ fontWeight: 700, borderRadius: 2, py: 1.4 }}
            >
              Start now
            </Button>
          </Box>

          {/* For Businesses Card */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '2px solid',
              borderColor: PRIMARY_MAIN,
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&:hover': { boxShadow: '0 12px 32px rgba(2,146,183,0.2)' },
              background: 'linear-gradient(135deg, rgba(2,146,183,0.03) 0%, rgba(2,146,183,0.01) 100%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: PRIMARY_MAIN,
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 99,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              For you
            </Box>
            <Storefront sx={{ fontSize: 40, color: '#6366F1', mb: 2.5 }} />
            <Typography variant='h5' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1.5, fontSize: '1.3rem' }}>
              I own a business
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3.5, textAlign: 'left' }}>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Attract and keep customers
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Simple subscription, no long-term contract
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: PRIMARY_MAIN, flexShrink: 0 }} />
                Easy dashboard, minimal effort
              </Typography>
            </Stack>
            <Button
              variant='contained'
              fullWidth
              onClick={() => onNavigate('/register/Business')}
              sx={{ fontWeight: 700, borderRadius: 2, py: 1.4, bgcolor: PRIMARY_MAIN, '&:hover': { bgcolor: '#4F46E5' } }}
            >
              Partner with us
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AudienceSplit;
