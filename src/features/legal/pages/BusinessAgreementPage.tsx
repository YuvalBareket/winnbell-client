import { Box, CircularProgress } from '@mui/material';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness } from '../../../store/selectors/authSelectors';
import baContent from '../content/business-agreement.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const WINNBELL_ENTITY = 'Delaware corporation';
const WINNBELL_JURISDICTION = 'Delaware';

const applySubstitutions = (text: string, businessName: string, effectiveDate: string) => {
  // Markdown escapes angle/square brackets as \<...\> and \[...\] in the raw string
  let result = text
    .replace(/\\<date\\>/g, effectiveDate)
    .replace(/<date>/g, effectiveDate);

  // Replace \[type of entity\] — first occurrence = Winnbell's, second = business's (left as-is)
  let entityCount = 0;
  result = result.replace(/\\\[type of entity\\\]/gi, () => {
    entityCount++;
    return entityCount === 1 ? WINNBELL_ENTITY : '[Type of Entity]';
  });

  // Replace \[jurisdiction\] — first occurrence = Winnbell's, second = business's (left as-is)
  let jurisdictionCount = 0;
  result = result.replace(/\\\[jurisdiction\\\]/gi, () => {
    jurisdictionCount++;
    return jurisdictionCount === 1 ? WINNBELL_JURISDICTION : '[Jurisdiction]';
  });

  result = result.replace(/\\\[name of participating business\\\]/gi, businessName);

  return result;
};

const BusinessAgreementPage = () => {
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const { data: bizData, isLoading } = useBusinessData();

  if (isLoading && isBusinessAdmin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  let content = baContent;
  if (bizData) {
    // Derive effective date from next billing date minus one month, or today as fallback
    let effectiveDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    if (bizData.current_period_end) {
      const nextBilling = new Date(bizData.current_period_end);
      nextBilling.setMonth(nextBilling.getMonth() - 1);
      effectiveDate = nextBilling.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    }
    content = applySubstitutions(baContent, bizData.name, effectiveDate);
  }

  return (
    <LegalDocumentPage
      title="Participating Business Agreement"
      lastUpdated="Last updated: May 3, 2026"
      content={content}
    />
  );
};

export default BusinessAgreementPage;
