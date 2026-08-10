import tosContent from '../content/terms-of-service.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const SUPPORT_EMAIL = 'support@winnbell.com';

const content = tosContent
  .replace(/\[SUPPORT EMAIL\]/g, SUPPORT_EMAIL);

const TermsOfServicePage = () => (
  <LegalDocumentPage
    title="Terms of Service"
    lastUpdated="Last updated: August 9, 2026"
    content={content}
  />
);

export default TermsOfServicePage;
