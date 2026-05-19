import { Box, Typography, Button, Container } from '@mui/material';
import { CheckCircle, EmojiEvents, Storefront } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

interface ForBusinessesProps {
  onNavigate: (path: string) => void;
  onScrollToBusinesses: () => void;
}

const ForBusinesses = ({ onNavigate }: ForBusinessesProps) => {
  return (
    <Box
      id='for-businesses'
      sx={{
        bgcolor: '#F8F9FF',
        py: { xs: 10, md: 14 },
        px: { xs: 2.5, md: 0 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth='lg'>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
          <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '2.2rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.1, mb: 2.5 }}>
            Grow your business with Winnbell
          </Typography>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, maxWidth: 520, mx: 'auto' }}>
            A subscription-based campaign that brings customers through your door - month after month.
          </Typography>
        </Box>

        {/* Three Value Props */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 3, md: 4 }, mb: { xs: 8, md: 10 } }}>
          {[
            { icon: <CheckCircle sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Campaign marketing that works', desc: 'Your business joins the monthly Winnbell campaign. Customers visit you to earn entries - giving them a real reason to return.' },
            { icon: <EmojiEvents sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Drive repeat customers', desc: 'Instead of one-time visits, customers come back throughout the campaign. More visits means more sales and stronger loyalty.' },
            { icon: <Storefront sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Simple dashboard', desc: 'Set up your business profile in minutes. Manage locations, track campaign entries, and see results - all in one place.' },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: { xs: 2.5, md: 3 },
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(25,93,230,0.1)' },
              }}
            >
              <Box sx={{ mb: 2 }}>{item.icon}</Box>
              <Typography sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1, fontSize: '1.1rem' }}>
                {item.title}
              </Typography>
              <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.65 }}>
                {item.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Stats Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 8, md: 10 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 3, md: 4 },
          }}
        >
          {[
            { stat: 'Monthly', label: 'Campaign cycle' },
            { stat: '< 1 day', label: 'To get started' },
            { stat: '100%', label: 'Local focus' },
          ].map((item, i) => (
            <Box key={i} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: PRIMARY_MAIN, mb: 0.5, letterSpacing: '-0.03em' }}>
                {item.stat}
              </Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Primary CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='contained'
            size='large'
            onClick={() => onNavigate('/register/Business')}
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              borderRadius: 2.5,
              px: 5,
              py: 1.8,
              boxShadow: '0 8px 24px rgba(25,93,230,0.3)',
              mb: 2,
              minWidth: 200,
              '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' },
            }}
          >
            Become a partner
          </Button>
          <Typography sx={{ display: 'block', color: TEXT_SECONDARY, fontSize: '0.9rem', fontWeight: 500 }}>
            Simple monthly subscription. Cancel anytime.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForBusinesses;
