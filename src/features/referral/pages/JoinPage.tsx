import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MailOutline } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useReferralCode } from '../hooks/useReferralCode';
import WelcomeInvite from '../../../shared/components/WelcomeInvite';
import { getActiveDraws } from '../../draw/api/draw.api';
import { queryKeys } from '../../../shared/constants/queryKeys';

import { trackFunnel } from '../../../shared/analytics/funnel';

// Conversion hero shown when a logged-out visitor opens a referral link
// (/join?ref=<code>). Shares its layout with ScanWelcomePage via WelcomeInvite; only the
// copy and steps differ. Captures the referral code before signup.
const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Capture the referral code so it survives the Supabase signup redirect.
  useEffect(() => {
    if (ref) {
      try { localStorage.setItem('pendingReferralCode', ref); } catch { /* storage unavailable (private mode) - signup still works, only the bonus attribution is lost */ }
      trackFunnel('join_landing_viewed');
    }
  }, [ref]);

  // Resolve the referral code to get the referrer's name for social proof.
  const { data: referralData, isLoading: refLoading } = useReferralCode(ref);
  const referrerName = referralData?.referrerName;

  // Live prize amount - the gold numeral the whole hero is built around.
  // retry 1 (not the default 3) so an API hiccup degrades to the no-numeral copy
  // quickly instead of holding the loader for the full backoff ladder.
  const { data: draws, isLoading: drawsLoading } = useQuery({
    queryKey: queryKeys.draws.active,
    queryFn: getActiveDraws,
    staleTime: 2 * 60_000,
    retry: 1,
  });
  const prize = draws?.find(d => d.status?.toLowerCase() === 'open')?.prize_amount ?? null;

  // Already signed in? Go to the main app.
  if (isAuthenticated) return <Navigate to="/scan" replace />;
  // No referral code - nothing to personalize, fall back to the normal landing.
  if (!ref) return <Navigate to="/" replace />;

  const subline = 'Start with a bonus entry, explore participating businesses for more, and come back every week for one entry on us.';

  return (
    <WelcomeInvite
      contextChip={{
        icon: <MailOutline />,
        label: referrerName ? `Invite from ${referrerName}` : 'Your Winnbell invite',
      }}
      brandHeadline={
        referrerName
          ? <>{referrerName} sent a little<br />extra luck your way.</>
          : <>A little extra luck,<br />sent your way.</>
      }
      brandTagline={
        referrerName
          ? `${referrerName} invited you to Winnbell. ${subline}`
          : `You have been invited to Winnbell. ${subline}`
      }
      leadClause={
        referrerName
          ? `${referrerName} sent you a head start toward the`
          : 'You have been sent a head start toward the'
      }
      prizeAmount={prize}
      loading={refLoading || drawsLoading}
      subtext={subline}
      steps={[
        'Claim your bonus entry',
        'Visit participating businesses',
        'Claim your weekly entry on us',
      ]}
      ctaLabel={referrerName ? `Accept ${referrerName}'s Invite` : 'Accept the Invite'}
    />
  );
};

export default JoinPage;
