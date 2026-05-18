import tosContent from '../content/terms-of-service.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const SUPPORT_EMAIL = 'support@winnbell.com';

const content = tosContent
  .replace(/\[SUPPORT EMAIL\]/g, SUPPORT_EMAIL)
  .replace(/\[05\/03\/2026\]/g, '05/03/2026');

const TermsOfServicePage = () => (
  <LegalDocumentPage
    title="Terms of Service"
    lastUpdated="Last updated: May 3, 2026"
    content={content}
  />
);

export default TermsOfServicePage;
