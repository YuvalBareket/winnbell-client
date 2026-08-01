import { Box, Typography, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { PRIMARY_MAIN, TEXT_SECONDARY, BG_SUBTLE, ALPHA_PRIMARY_06, BORDER_SUBTLE } from '../../../shared/colors';

const TrustItem = ({ icon: Icon, label, delay }: { icon: React.ComponentType<any>; label: string; delay: number }) => {
  const isLink = label === 'See official rules';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Box
        component={isLink ? 'a' : 'div'}
        href={isLink ? '/rules' : undefined}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 0.75, md: 1.25 },
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 1.5, md: 2 },
          bgcolor: ALPHA_PRIMARY_06,
          border: '1px solid',
          borderColor: BORDER_SUBTLE,
          borderRadius: 2,
          cursor: isLink ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          textDecoration: 'none',
          '&:hover': isLink ? {
            bgcolor: BG_SUBTLE,
            borderColor: PRIMARY_MAIN,
            transform: 'translateY(-2px)',
          } : {},
        }}
      >
        <Icon
          sx={{
            fontSize: { xs: '1.5rem', md: '1.75rem' },
            color: PRIMARY_MAIN,
          }}
        />
        <Typography
          sx={{
            color: isLink ? PRIMARY_MAIN : TEXT_SECONDARY,
            fontSize: { xs: '0.75rem', md: '0.85rem' },
            fontWeight: isLink ? 700 : 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            textAlign: 'center',
          }}
        >
          {label}
          {isLink && <OpenInNewIcon sx={{ fontSize: '0.75rem' }} />}
        </Typography>
      </Box>
    </motion.div>
  );
};

const Testimonial = () => {
  return (
    <Box sx={{ py: { xs: 3, md: 5 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth='md'>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 2 }}
          justifyContent='center'
          alignItems='stretch'
        >
          <TrustItem icon={VerifiedUserIcon} label='Every entry has equal odds' delay={0} />
          <TrustItem icon={MoneyOffIcon} label='No purchase necessary' delay={0.1} />
          <TrustItem icon={OpenInNewIcon} label='See official rules' delay={0.2} />
        </Stack>
      </Container>
    </Box>
  );
};

export default Testimonial;
