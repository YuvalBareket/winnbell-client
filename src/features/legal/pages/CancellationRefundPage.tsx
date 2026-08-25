import policyContent from '../content/cancellation-refund.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const CancellationRefundPage = () => (
  <LegalDocumentPage
    title="Cancellation & Refund Policy"
    lastUpdated="Last updated: August 25, 2026"
    content={policyContent}
  />
);

export default CancellationRefundPage;
