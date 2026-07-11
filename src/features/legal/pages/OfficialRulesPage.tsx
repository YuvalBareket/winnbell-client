import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { api } from '../../../shared/api/client';
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
  draw_date: string;
  status: string;
}

const OfficialRulesPage = () => {
  const { drawId } = useParams<{ drawId: string }>();
  const [draw, setDraw] = useState<DrawInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraw = drawId
      ? api.get<DrawInfo>(`/draws/${drawId}`).then(({ data }) => data)
      : api.get<DrawInfo[]>('/draws/active').then(({ data }) => data[0] ?? null);

    fetchDraw
      .then((d) => setDraw(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [drawId]);

  const content = (() => {
    let text = applyStaticSubstitutions(rulesContent);
    if (draw) {
      const drawDate = new Date(draw.draw_date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const prizeAmount = parseFloat(draw.prize_amount).toLocaleString('en-US', {
        style: 'currency', currency: 'USD',
      });
      const dt = new Date(draw.draw_date);
      const startDate = new Date(dt.getFullYear(), dt.getMonth(), 1)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const endDate = new Date(dt.getFullYear(), dt.getMonth() + 1, 0)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
