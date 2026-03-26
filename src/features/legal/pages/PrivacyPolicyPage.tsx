import { Box, Container, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage = () => {
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
          Privacy Policy
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Last updated: March 2026
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Section title='1. Information We Collect'>
          We collect information you provide directly, such as your name, email address, and
          password when you register. For business accounts, we also collect business details,
          location data, and subscription information.
        </Section>

        <Section title='2. How We Use Your Information'>
          We use your information to operate and improve Winnbell, process transactions, send
          service-related communications, and provide customer support. We do not sell your
          personal data to third parties.
        </Section>

        <Section title='3. Authentication'>
          Winnbell uses Clerk for secure authentication. When you sign in with Google or Apple,
          we receive your name and email address from those providers. We do not receive or store
          your social account passwords.
        </Section>

        <Section title='4. Location Data'>
          Location data is used solely to show you nearby businesses on the map. We do not store
          your precise location permanently or share it with third parties.
        </Section>

        <Section title='5. Data Sharing'>
          We may share your information with service providers who assist in operating our
          platform (e.g., hosting, authentication, mapping). All providers are bound by
          confidentiality agreements.
        </Section>

        <Section title='6. Data Retention'>
          We retain your account data for as long as your account is active. You may request
          deletion of your account and associated data by contacting us.
        </Section>

        <Section title='7. Security'>
          We implement industry-standard security measures to protect your data, including
          encrypted storage and secure connections. However, no method of transmission over the
          internet is 100% secure.
        </Section>

        <Section title='8. Your Rights'>
          Depending on your jurisdiction, you may have rights to access, correct, or delete your
          personal data. To exercise these rights, contact us at privacy@winnbell.com.
        </Section>

        <Section title='9. Changes to This Policy'>
          We may update this policy periodically. We will notify you of significant changes via
          email or an in-app notice.
        </Section>

        <Section title='10. Contact'>
          For privacy-related questions, contact us at privacy@winnbell.com.
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

export default PrivacyPolicyPage;
