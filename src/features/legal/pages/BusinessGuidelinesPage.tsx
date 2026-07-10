import guidelinesContent from '../content/business-guidelines.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const BusinessGuidelinesPage = () => (
  <LegalDocumentPage
    title="Business Participation Guidelines"
    lastUpdated="Last updated: July 10, 2026"
    content={guidelinesContent}
  />
);

export default BusinessGuidelinesPage;
