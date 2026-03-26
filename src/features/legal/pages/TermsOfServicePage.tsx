import { Box, Container, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Box sx={{ p: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIosNew fontSize='small' />
        </IconButton>
      </Box>

      <Container maxWidth='sm' sx={{ pb: 6 }}>
        <Typography variant='h4' fontWeight={800} sx={{ mb: 1 }}>
          Terms of Service
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Last updated: March 2026
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Section title='1. Acceptance of Terms'>
          By accessing or using Winnbell, you agree to be bound by these Terms of Service. If you
          do not agree, please do not use the platform.
        </Section>

        <Section title='2. Use of the Platform'>
          Winnbell provides a digital ticketing platform connecting businesses and customers. You
          agree to use the platform only for lawful purposes and in accordance with these terms.
          You must not misuse tickets, attempt to exploit the system, or engage in fraudulent
          activity.
        </Section>

        <Section title='3. Accounts'>
          You are responsible for maintaining the confidentiality of your account credentials. You
          agree to notify us immediately of any unauthorized access. We reserve the right to
          suspend or terminate accounts that violate these terms.
        </Section>

        <Section title='4. Business Partners'>
          Businesses registered on Winnbell are solely responsible for the accuracy of their
          ticket terms, prize descriptions, and draw conditions. Winnbell acts as a platform
          intermediary and is not liable for business-defined offers or outcomes.
        </Section>

        <Section title='5. Intellectual Property'>
          All content, trademarks, and materials on Winnbell are the property of Winnbell or its
          licensors. You may not reproduce or distribute any content without explicit written
          permission.
        </Section>

        <Section title='6. Limitation of Liability'>
          Winnbell is provided "as is" without warranties of any kind. We are not liable for any
          indirect, incidental, or consequential damages arising from your use of the platform.
        </Section>

        <Section title='7. Changes to Terms'>
          We reserve the right to update these terms at any time. Continued use of the platform
          after changes constitutes acceptance of the new terms.
        </Section>

        <Section title='8. Contact'>
          For questions regarding these terms, contact us at support@winnbell.com.
        </Section>
      </Container>
    </Box>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.8 }}>
      {children}
    </Typography>
  </Box>
);

export default TermsOfServicePage;
