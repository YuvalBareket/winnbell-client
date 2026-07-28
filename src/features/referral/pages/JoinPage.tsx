import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { PersonAddOutlined, CardGiftcardOutlined, EmojiEventsOutlined } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useReferralCode } from '../hooks/useReferralCode';
import WelcomeInvite from '../../../shared/components/WelcomeInvite';
import {
  PRIMARY_MAIN, ALPHA_PRIMARY_10, ALPHA_GREEN_10, STATUS_ACTIVATED_TEXT,
  ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK,
} from '../../../shared/colors';

// Friendly landing-style welcome shown when a logged-out visitor opens a referral link
// (/join?ref=<code>). Shares its layout with ScanWelcomePage via WelcomeInvite; only the copy and
// steps differ. Captures the referral code before signup.
const JoinPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Capture the referral code so it survives the Supabase signup redirect.
  useEffect(() => {
    if (ref) localStorage.setItem('pendingReferralCode', ref);
  }, [ref]);

  // Resolve the referral code to get the referrer's name for social proof.
  const { data: referralData } = useReferralCode(ref);
  const referrerName = referralData?.referrerName;

  // Already signed in? Go to the main app.
  if (isAuthenticated) return <Navigate to="/scan" replace />;
  // No referral code - nothing to personalize, fall back to the normal landing.
  if (!ref) return <Navigate to="/" replace />;

  return (
    <WelcomeInvite
      brandHeadline={<>Your invite to<br />the monthly draw.</>}
      brandTagline={
        referrerName
          ? `${referrerName} invited you to Winnbell. Create your free account and claim a bonus entry just for joining.`
          : 'You have been invited to Winnbell. Create your free account and claim a bonus entry just for joining.'
      }
      headline={referrerName ? `${referrerName} invited you to Winnbell` : 'You are invited to Winnbell'}
      steps={[
        {
          icon: <PersonAddOutlined />,
          title: 'Join for free',
          text: 'Create an account in seconds, no payment required.',
          tint: ALPHA_PRIMARY_10,
          iconColor: PRIMARY_MAIN,
        },
        {
          icon: <CardGiftcardOutlined />,
          title: 'Earn your bonus entry',
          text: 'Get a bonus entry just for joining.',
          tint: ALPHA_GREEN_10,
          iconColor: STATUS_ACTIVATED_TEXT,
        },
        {
          icon: <EmojiEventsOutlined />,
          title: 'Enter the monthly draw',
          text: 'Compete for cash prizes every month. No purchase necessary.',
          tint: ACCENT_GOLD_LIGHT,
          iconColor: ACCENT_GOLD_DARK,
        },
      ]}
    />
  );
};

export default JoinPage;
