import { Box, CircularProgress } from '@mui/material';
import { useOfficialRulesContent } from '../hooks/useOfficialRulesContent';
import LegalDocumentPage from './LegalDocumentPage';

// Always renders the CURRENT campaign's rules. Past campaigns' rules are archived
// as PDFs at draw close; they are deliberately not browsable in-app.
const OfficialRulesPage = () => {
  const { content, loading } = useOfficialRulesContent();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'var(--dvh100, 100dvh)' }}>
        <CircularProgress aria-label='Loading' />
      </Box>
    );
  }

  return (
    <LegalDocumentPage
      title="Official Rules"
      lastUpdated="Last updated: August 9, 2026"
      content={content}
    />
  );
};

export default OfficialRulesPage;
