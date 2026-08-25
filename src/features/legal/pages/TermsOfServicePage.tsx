import tosContent from '../content/terms-of-service.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const SUPPORT_EMAIL = 'support@winnbell.com';

const content = tosContent
  .replace(/\[SUPPORT EMAIL\]/g, SUPPORT_EMAIL);

const TermsOfServicePage = () => (
  <LegalDocumentPage
    title="Terms of Service"
    content={content}
  />
);

export default TermsOfServicePage;
