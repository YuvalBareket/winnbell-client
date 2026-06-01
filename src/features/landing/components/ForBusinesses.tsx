import { Box, Typography, Button, Container } from '@mui/material';
import { Map, Receipt, BarChart } from '@mui/icons-material';
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
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '3rem' }, letterSpacing: '-0.03em', lineHeight: 1.15, mb: { xs: 2, md: 2.5 } }}>
            The cheapest marketing tool you'll ever use
          </Typography>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: { xs: '0.95rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: 560, mx: 'auto' }}>
            One flat monthly subscription. Your business appears on the Winnbell map, and every customer who submits a receipt from your store is proof they chose you over the competition.
          </Typography>
        </Box>

        {/* Three Value Props */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 2.5, md: 4 }, mb: { xs: 6, md: 10 } }}>
          {[
            { icon: <Map sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Be the obvious choice', desc: 'Customers browsing Winnbell pick participating businesses over ones that aren\'t listed. A flat monthly subscription puts you on their map. Literally.' },
            { icon: <Receipt sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'Proof, not promises', desc: 'A receipt submitted from your store means one thing: a customer chose you. Every entry is location-tagged and sitting in your dashboard.' },
            { icon: <BarChart sx={{ fontSize: 32, color: PRIMARY_MAIN }} />, title: 'See what\'s working', desc: 'Entries per location. Unique visitors. Campaign comparisons. The cheapest customer acquisition channel you\'ve ever measured.' },
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: '0 8px 24px rgba(25,93,230,0.1)' },
              }}
            >
              <Box sx={{ mb: { xs: 1.5, md: 2 } }}>{item.icon}</Box>
              <Typography sx={{ fontWeight: 800, color: TEXT_HEADING, mb: { xs: 0.75, md: 1 }, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                {item.title}
              </Typography>
              <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, fontSize: { xs: '0.875rem', md: 'inherit' } }}>
                {item.desc}
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
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              borderRadius: 2.5,
              px: { xs: 2.5, md: 5 },
              py: { xs: 1.4, md: 1.8 },
              width: { xs: '100%', md: 'auto' },
              boxShadow: '0 8px 24px rgba(25,93,230,0.3)',
              mb: { xs: 1.5, md: 2 },
              minWidth: { xs: 'auto', md: 200 },
              '&:hover': { boxShadow: '0 12px 32px rgba(25,93,230,0.4)' },
            }}
          >
            Become a partner
          </Button>
          <Typography sx={{ display: 'block', color: TEXT_SECONDARY, fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 500 }}>
            Simple monthly subscription. Cancel anytime.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForBusinesses;
