import { useQuery } from '@tanstack/react-query';
import { api } from '../../../shared/api/client';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { US_STATES } from '../../../shared/constants/usStates';
import rulesContent from '../content/official-rules.md?raw';

const SUPPORT_EMAIL = 'support@winnbell.com';
const PRIVACY_URL = 'https://winnbell.com/privacy';
const COMPANY_ADDRESS = 'Wilmington, Delaware';
const MAX_ENTRIES_PER_USER = '30';
const TIME_ZONE = 'Eastern Time (ET)';

// Eligible Jurisdictions (Section 2, and through it the residency rule in 4.1) mirror the
// admin's allowed-states platform setting - the same source the signup region gate and the
// profile state pickers use, so the legal text can never drift from what the gate enforces.
// Lawyer instruction 2026-07-31 (Ido): default is Florida only; an empty/unloaded setting
// falls back to that.
const DEFAULT_JURISDICTIONS = 'State of Florida, United States only';

const formatJurisdictions = (codes: string[] | undefined): string => {
  const names = (codes ?? [])
    .map((code) => US_STATES.find((s) => s.code === code)?.name ?? code)
    .sort();
  if (names.length === 0) return DEFAULT_JURISDICTIONS;
  const list = names.length === 1
    ? names[0]
    : names.length === 2
    ? `${names[0]} and ${names[1]}`
    : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  return `${names.length === 1 ? 'State' : 'States'} of ${list}, United States only`;
};

const applyStaticSubstitutions = (text: string, eligibleJurisdictions: string) => text
  .replace(/\[Privacy Policy URL\]/g, PRIVACY_URL)
  .replace(/\[Contact Email\]/g, SUPPORT_EMAIL)
  .replace(/<insert postal address of company>/g, COMPANY_ADDRESS)
  .replace(/\[List of Eligible Jurisdictions\]/g, eligibleJurisdictions)
  .replace(/\[Entry Cap\]/g, MAX_ENTRIES_PER_USER)
  .replace(/\[Time Zone\]/g, TIME_ZONE)
  .replace(/\[If Applicable\]/g, 'None')
  .replace(/\[Additional Campaign-Specific Terms\]/g, 'None');

interface DrawInfo {
  id: number;
  name: string;
  prize_amount: string | null;
  start_date?: string;
  draw_date: string;
  status: string;
}

/**
 * Hook to fetch and build Official Rules content with draw-specific substitutions.
 * Supports both drawId-specific rules and active-draw rules (default).
 * Returns { content, loading } tuple for easy integration.
 */
export const useOfficialRulesContent = (drawId?: string) => {
  const { data: draw = null, isPending: drawPending } = useQuery<DrawInfo | null>({
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

  // Same key + endpoint as ProfileSetupPage / ProfileEditDialog so the cache is shared.
  const { data: regionConfig, isPending: regionPending } = useQuery({
    queryKey: ['auth', 'region-config'],
    queryFn: async () => (await api.get<{ allowed_states: string[] }>('/auth/region-config')).data,
    staleTime: 10 * 60_000,
    retry: false,
  });

  const loading = drawPending || regionPending;

  const content = (() => {
    let text = applyStaticSubstitutions(rulesContent, formatJurisdictions(regionConfig?.allowed_states));
    if (draw) {
      // Campaign boundaries are NY-timed instants; format them in NY so the legal dates
      // never shift a day for readers in other timezones.
      const nyDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', {
        timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric',
      });
      const drawDate = nyDate(draw.draw_date);
      // An upcoming campaign's prize can be hidden (NULL) until the admin reveals it.
      const prizeAmount = draw.prize_amount != null
        ? parseFloat(draw.prize_amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : 'To be announced';
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

  return { content, loading };
};
