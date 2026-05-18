import privacyContent from '../content/privacy-policy.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const SUPPORT_EMAIL = 'support@winnbell.com';

const content = privacyContent
  .replace(/\[add email here\]/g, SUPPORT_EMAIL)
  .replace(/\[add contact method here\]/g, `Email: ${SUPPORT_EMAIL}`)
  .replace(/\[APPEALS EMAIL\]/g, SUPPORT_EMAIL);

const PrivacyPolicyPage = () => (
  <LegalDocumentPage
    title="Privacy Policy"
    lastUpdated="Last updated: April 16, 2026"
    content={content}
  />
);

export default PrivacyPolicyPage;
