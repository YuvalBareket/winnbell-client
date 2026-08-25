import termsContent from '../content/founding-partner-terms.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const FoundingPartnerTermsPage = () => (
  <LegalDocumentPage
    title="Founding Partner Special Terms"
    content={termsContent}
  />
);

export default FoundingPartnerTermsPage;
