import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useOfficialRulesContent } from '../hooks/useOfficialRulesContent';
import LegalDocumentPage from './LegalDocumentPage';

const OfficialRulesPage = () => {
  const { drawId } = useParams<{ drawId: string }>();
  const { content, loading } = useOfficialRulesContent(drawId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'var(--dvh100, 100dvh)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LegalDocumentPage
      title="Official Rules"
      lastUpdated="Last updated: July 25, 2026"
      content={content}
    />
  );
};

export default OfficialRulesPage;
