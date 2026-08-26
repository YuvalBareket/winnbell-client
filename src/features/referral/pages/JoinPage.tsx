import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CardGiftcard, Storefront, Loop } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useReferralCode } from '../hooks/useReferralCode';
import WelcomeInvite, { WelcomeHighlight } from '../../../shared/components/WelcomeInvite';
import { getActiveDraws } from '../../draw/api/draw.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import { formatCurrency } from '../../../shared/utils/date';

import { trackFunnel } from '../../../shared/analytics/funnel';

// Friendly landing-style welcome shown when a logged-out visitor opens a referral link
// (/join?ref=<code>). Shares its layout with ScanWelcomePage via WelcomeInvite; only the copy and
// steps differ. Captures the referral code before signup.
const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Capture the referral code so it survives the Supabase signup redirect.
  useEffect(() => {
    if (ref) {
      localStorage.setItem('pendingReferralCode', ref);
      trackFunnel('join_landing_viewed');
    }
  }, [ref]);

  // Resolve the referral code to get the referrer's name for social proof.
  const { data: referralData } = useReferralCode(ref);
  const referrerName = referralData?.referrerName;

  // Live prize amount for the "head start toward the $X cash-prize draw" headline.
  const { data: draws } = useQuery({
    queryKey: queryKeys.draws.active,
    queryFn: getActiveDraws,
    staleTime: 2 * 60_000,
  });
  const prize = draws?.find(d => d.status?.toLowerCase() === 'open')?.prize_amount ?? null;

  // Already signed in? Go to the main app.
  if (isAuthenticated) return <Navigate to="/scan" replace />;
  // No referral code - nothing to personalize, fall back to the normal landing.
  if (!ref) return <Navigate to="/" replace />;

  const subline = 'Start with a bonus entry, explore participating businesses for more, and come back every week for one entry on us.';

  // "the $5,000 cash-prize draw" with the amount emphasized, or plain when the prize is hidden.
  const drawLabel = prize
    ? <><WelcomeHighlight>{formatCurrency(prize)}</WelcomeHighlight> cash-prize draw</>
    : <>cash-prize draw</>;

  return (
    <WelcomeInvite
      contextChip={{
        icon: <CardGiftcard />,
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
      headline={
        referrerName
          ? <><WelcomeHighlight>{referrerName}</WelcomeHighlight> sent you a head start toward the {drawLabel}.</>
          : <>You have been sent a head start toward the {drawLabel}.</>
      }
      subtext={subline}
      steps={[
        {
          icon: <CardGiftcard />,
          title: 'Start with a bonus entry',
          text: 'Join Winnbell for free and your referral bonus gets you started.',
        },
        {
          icon: <Storefront />,
          title: 'Keep earning entries',
          text: 'Turn purchases at participating businesses into more chances to win.',
        },
        {
          icon: <Loop />,
          title: 'Come back every week',
          text: 'Get one entry on us every week - just claim it.',
        },
      ]}
      ctaLabel={referrerName ? `Accept ${referrerName}'s Invite` : 'Accept the Invite'}
    />
  );
};

export default JoinPage;
