import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import { queryKeys } from '../../../shared/constants/queryKeys';
import rulesContent from '../content/official-rules.md?raw';
import LegalDocumentPage from './LegalDocumentPage';

const SUPPORT_EMAIL = 'support@winnbell.com';
const PRIVACY_URL = 'https://winnbell.com/privacy';
const COMPANY_ADDRESS = 'Wilmington, Delaware';
const ELIGIBLE_JURISDICTIONS = 'United States (excluding where prohibited by applicable law)';
const MAX_ENTRIES_PER_USER = '30';
const TIME_ZONE = 'Eastern Time (ET)';

const applyStaticSubstitutions = (text: string) => text
  .replace(/\[Privacy Policy URL\]/g, PRIVACY_URL)
  .replace(/\[Contact Email\]/g, SUPPORT_EMAIL)
  .replace(/<insert postal address of company>/g, COMPANY_ADDRESS)
  .replace(/\[List of Eligible Jurisdictions\]/g, ELIGIBLE_JURISDICTIONS)
  .replace(/\[Entry Cap\]/g, MAX_ENTRIES_PER_USER)
  .replace(/\[Time Zone\]/g, TIME_ZONE)
  .replace(/\[If Applicable\]/g, 'None')
  .replace(/\[Additional Campaign-Specific Terms\]/g, 'None');

interface DrawInfo {
  id: number;
  name: string;
  prize_amount: string;
  start_date?: string;
  draw_date: string;
  status: string;
}

const OfficialRulesPage = () => {
  const { drawId } = useParams<{ drawId: string }>();

  const { data: draw = null, isPending: loading } = useQuery<DrawInfo | null>({
    queryKey: drawId
      ? [...queryKeys.draws.all, 'rules', drawId]
      : [...queryKeys.draws.all, 'rules', 'active'],
    queryFn: async () => {
      if (drawId) {
        const { data } = await api.get<DrawInfo>(`/draws/${drawId}`);
        return data;
      }
      const { data } = await api.get<DrawInfo[]>('/draws/active');
      return data[0] ?? null;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });

  const content = (() => {
    let text = applyStaticSubstitutions(rulesContent);
    if (draw) {
      // Campaign boundaries are NY-timed instants; format them in NY so the legal dates
      // never shift a day for readers in other timezones.
      const nyDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', {
        timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric',
      });
      const drawDate = nyDate(draw.draw_date);
      const prizeAmount = parseFloat(draw.prize_amount).toLocaleString('en-US', {
        style: 'currency', currency: 'USD',
      });
      // Pre-migration rows can lack start_date; never let "Jan 1 1970" into legal copy.
      const startDate = draw.start_date ? nyDate(draw.start_date) : 'See Platform';
      const endDate = drawDate;

      text = text
        .replace(/\[Campaign Name\]/g, draw.name)
        .replace(/\[Start Date & Time\]/g, `${startDate} at 12:00 AM ${TIME_ZONE}`)
        .replace(/\[End Date & Time\]/g, `${endDate} at 11:59 PM ${TIME_ZONE}`)
        .replace(/\[Draw Date\]/g, drawDate)
        .replace(/\[Prize Description\]/g, `Cash prize of ${prizeAmount}`)
        .replace(/\[Prize Value\]/g, prizeAmount);
    } else {
      text = text
        .replace(/\[Campaign Name\]/g, 'Current Campaign')
        .replace(/\[Start Date & Time\]/g, 'See Platform')
        .replace(/\[End Date & Time\]/g, 'See Platform')
        .replace(/\[Draw Date\]/g, 'See Platform')
        .replace(/\[Prize Description\]/g, 'See Platform')
        .replace(/\[Prize Value\]/g, 'See Platform');
    }
    return text;
  })();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'var(--dvh100, 100dvh)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LegalDocumentPage
      title="Official Rules"
      lastUpdated="Last updated: May 3, 2026"
      content={content}
    />
  );
};

export default OfficialRulesPage;
