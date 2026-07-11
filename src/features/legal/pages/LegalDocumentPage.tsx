import { Box, Container, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { BG_PAGE } from '../../../shared/colors';

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
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
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

        <Box
          sx={{
            '& h1, & h2, & h3': { fontWeight: 700, mt: 3, mb: 1, fontSize: '1rem' },
            '& p': { mb: 1.5, lineHeight: 1.8, fontSize: '0.875rem', color: 'text.secondary' },
            '& ul, & ol': { pl: 2.5, mb: 1.5 },
            '& li': { mb: 0.5, fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.7 },
            '& strong': { color: 'text.primary', fontWeight: 700 },
            '& a': { color: 'primary.main' },
            '& hr': { my: 3 },
          }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      </Container>
    </Box>
  );
};

export default LegalDocumentPage;
