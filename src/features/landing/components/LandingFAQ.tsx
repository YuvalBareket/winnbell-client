import { Box, Typography, Stack, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

const FAQ_ITEMS = [
  {
    q: 'Is it free for consumers?',
    a: 'Yes, completely. Sign up, submit your receipts, and enter draws for free.',
  },
  {
    q: 'How are winners chosen?',
    a: 'Winners are selected randomly from all eligible entries in the campaign pool. Every entry has an equal chance.',
  },
  {
    q: 'How do businesses benefit?',
    a: 'Partner businesses pay a subscription to be featured in the Winnbell campaign. In return, customers visit your location to earn entries - driving repeat foot traffic and sales throughout the campaign period.',
  },
  {
    q: 'How does the business subscription work?',
    a: 'Businesses subscribe monthly to participate in Winnbell campaigns. There are no long-term commitments - you can cancel at any time. Pricing depends on the number of locations.',
  },
];

const LandingFAQ = () => {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
      <Container maxWidth='sm'>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 2 }}>
            FAQ
          </Box>
          <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
            Common questions
          </Typography>
        </Box>
        <Stack spacing={1.5}>
          {FAQ_ITEMS.map((item, i) => (
            <Accordion
              key={i}
              elevation={0}
              disableGutters
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px !important',
                '&:before': { display: 'none' },
                overflow: 'hidden',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 56, px: 2.5, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Typography fontWeight={700} color={TEXT_HEADING} fontSize='0.95rem'>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 2.5, px: 2.5 }}>
                <Typography variant='body2' color={TEXT_SECONDARY} lineHeight={1.7}>{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingFAQ;
