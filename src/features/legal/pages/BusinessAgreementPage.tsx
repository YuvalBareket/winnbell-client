import baContent from '../content/business-agreement.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

// The 2026-06-30 Participating Business Agreement identifies the business via the enrollment
// record ("the business identified during the enrollment process"), so there are no fill-in
// recital tokens to substitute. (The old [type of entity]/[jurisdiction] substitution that
// wrongly declared every business a Delaware corporation has been removed.)
const BusinessAgreementPage = () => (
  <LegalDocumentPage
    title="Participating Business Agreement"
    content={baContent}
  />
);

export default BusinessAgreementPage;
