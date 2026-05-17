import { Box, Typography, Container } from '@mui/material';
import { PRIMARY_MAIN, TEXT_SECONDARY, TEXT_HEADING } from '../../../shared/colors';

const Testimonial = () => {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth='md'>
        <Box sx={{ maxWidth: 560, mx: 'auto' }}>
          <Box sx={{ display: 'inline-block', borderRadius: 99, px: 1.5, py: 0.5, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', bgcolor: 'rgba(25,93,230,0.08)', color: PRIMARY_MAIN, mb: 3 }}>
            What partners say
          </Box>
          <Box sx={{ borderLeft: '4px solid', borderColor: 'primary.main', pl: { xs: 2.5, md: 4 }, py: 1 }}>
            <Typography sx={{ fontStyle: 'italic', color: TEXT_HEADING, fontSize: { xs: '1.1rem', md: '1.3rem' }, lineHeight: 1.7, fontWeight: 400, mb: 2.5, letterSpacing: '-0.01em' }}>
              Winnbell gives us a reason to bring customers back every month. The dashboard is easy to use and the results speak for themselves.
            </Typography>
            <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>
              Alex M.
              <Box component='span' sx={{ mx: 1, opacity: 0.3 }}>|</Box>
              Restaurant Owner, Dublin
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonial;
