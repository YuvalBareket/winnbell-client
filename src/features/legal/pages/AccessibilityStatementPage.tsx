import accessibilityContent from '../content/accessibility-statement.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const AccessibilityStatementPage = () => (
  <LegalDocumentPage
    title="Accessibility Statement"
    lastUpdated="Last updated: August 1, 2026"
    content={accessibilityContent}
  />
);

export default AccessibilityStatementPage;
