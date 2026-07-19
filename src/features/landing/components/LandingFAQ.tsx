import { Box, Typography, Stack, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'framer-motion';
import { ExpandMore } from '@mui/icons-material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

const FAQ_ITEMS = [
  {
    q: 'Is it free for consumers?',
    a: 'Yes, completely. Every member receives one campaign entry every week - no purchase required. You can also earn additional entries by submitting receipts from partner businesses. No purchase is necessary to participate or win.',
  },
  {
    q: 'How are winners chosen?',
    a: 'At the end of each monthly campaign, one winner is selected at random from all eligible entries in the pool. Every entry - whether earned from a receipt or claimed as the weekly entry - has an equal chance of winning.',
  },
  {
    q: 'How do businesses benefit?',
    a: 'Partner businesses pay a subscription to be featured in the Winnbell campaign and listed on the Winnbell map. Customers who visit a partner location can submit receipts to earn campaign entries, giving them a free, non-purchase-required reason to choose your business.',
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
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 2 }}>
              FAQ
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Typography variant='h3' sx={{ fontWeight: 900, color: TEXT_HEADING, fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
              Common questions
            </Typography>
          </motion.div>
        </Box>
        <Stack spacing={1.5}>
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Accordion
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
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingFAQ;
