import termsContent from '../content/founding-partner-terms.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const FoundingPartnerTermsPage = () => (
  <LegalDocumentPage
    title="Founding Partner Special Terms"
    lastUpdated="Last updated: July 24, 2026"
    content={termsContent}
  />
);

export default FoundingPartnerTermsPage;
