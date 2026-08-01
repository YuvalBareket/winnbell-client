import { Box, Container, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BG_PAGE } from '../../../shared/colors';
import LegalMarkdown from '../components/LegalMarkdown';

interface Props {
  title: string;
  lastUpdated: string;
  content: string;
}

const LegalDocumentPage = ({ title, lastUpdated, content }: Props) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', bgcolor: BG_PAGE }}>
      <Box sx={{ p: 2 }}>
        <IconButton aria-label='Go back' onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
          <ArrowBackIosNew fontSize="small" />
        </IconButton>
      </Box>

      <Container maxWidth="sm" sx={{ pb: 8, px: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {lastUpdated}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <LegalMarkdown content={content} />
      </Container>
    </Box>
  );
};

export default LegalDocumentPage;
