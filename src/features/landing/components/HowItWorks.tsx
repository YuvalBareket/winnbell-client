import { Box, Typography, Stack, Container } from '@mui/material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

const STEPS = [
  {
    num: '01',
    title: 'Join for free',
    body: 'Create your free account and claim your weekly free entry. No purchase necessary - ever.',
  },
  {
    num: '02',
    title: 'Earn entries',
    body: 'Visit a Winnbell partner business and submit your receipt to earn additional campaign entries.',
  },
  {
    num: '03',
    title: 'Win prizes',
    body: 'At the end of each monthly campaign, one winner is selected at random from all eligible entries.',
  },
];

const HowItWorks = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
      <Container maxWidth='lg'>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
          <Box sx={{ display: 'inline-block', borderRadius: 99, px: { xs: 1.25, md: 1.5 }, py: { xs: 0.4, md: 0.5 }, fontSize: { xs: '0.6rem', md: '0.65rem' }, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 1.5 }}>
            How it works
          </Box>
          <Typography variant='h2' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.75rem', md: '2.8rem' }, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Three steps to your first entry
          </Typography>
        </Box>

        {/* Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, position: 'relative', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Box sx={{ position: 'absolute', top: 32, left: '15%', right: '15%', height: 0, borderTop: '2px dashed rgba(25,93,230,0.2)', zIndex: 0 }} />
          {STEPS.map((step, i) => (
            <Box key={step.num} sx={{ flex: 1, maxWidth: 280, textAlign: 'center', position: 'relative', zIndex: 1, px: 2, mt: i === 1 ? 5 : 0 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem', mx: 'auto', mb: 2.5, boxShadow: '0 8px 24px rgba(25,93,230,0.3)' }}>
                {step.num}
              </Box>
              <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
                <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 1, fontSize: '1.05rem' }}>{step.title}</Typography>
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.7 }}>{step.body}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Mobile */}
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {STEPS.map((step) => (
            <Stack key={step.num} direction='row' spacing={1.5} alignItems='flex-start'>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: PRIMARY_MAIN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', flexShrink: 0, boxShadow: '0 6px 18px rgba(25,93,230,0.3)' }}>
                  {step.num}
                </Box>
                <Box sx={{ width: 2, flex: 1, bgcolor: 'rgba(25,93,230,0.12)', mt: 0.75, minHeight: 16 }} />
              </Box>
              <Box sx={{ flex: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 0.5 }}>
                <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, mb: 0.5, fontSize: '0.95rem' }}>{step.title}</Typography>
                <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, fontSize: '0.875rem' }}>{step.body}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default HowItWorks;
