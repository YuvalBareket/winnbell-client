import baContent from '../content/business-agreement.md?raw';
import LegalAcceptDialog from './LegalAcceptDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}

// Lazy-loaded wrapper so the agreement markdown stays out of the eager register bundle.
// Same source document as /business-agreement (raw, no substitutions - the agreement
// identifies the business via the enrollment record).
const BusinessAgreementAcceptDialog = (props: Props) => (
  <LegalAcceptDialog {...props} title='Business Agreement' content={baContent} />
);

export default BusinessAgreementAcceptDialog;
