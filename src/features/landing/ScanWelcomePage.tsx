import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ReceiptLongOutlined, EmojiEventsOutlined, CardGiftcardOutlined } from '@mui/icons-material';
import { api } from '../../shared/api/client';
import { useAppSelector } from '../../store/hook';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';
import WelcomeInvite from '../../shared/components/WelcomeInvite';
import { formatCurrency } from '../../shared/utils/date';
import {
  PRIMARY_MAIN, ALPHA_PRIMARY_10, ALPHA_GREEN_10, STATUS_ACTIVATED_TEXT,
  ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK,
} from '../../shared/colors';

// Friendly landing-style welcome shown when a logged-out visitor scans a flyer QR (/start?l=<id>).
// Shares its layout with the referral JoinPage via WelcomeInvite; only the copy and steps differ.
// After sign-up, useSupabaseSync returns them to /scan?l=<id>.
interface PublicLocation {
  business_name: string;
  location_name: string;
  logo_url: string | null;
  draw_prize_amount: number | null;
  draw_date: string | null;
}

const ScanWelcomePage = () => {
  const [searchParams] = useSearchParams();
  const lid = searchParams.get('l');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Remember the location so that after sign-up the user lands back on /scan?l=<id>.
  useEffect(() => {
    if (lid) localStorage.setItem('pendingLocationId', lid);
  }, [lid]);

  const { data: loc } = useQuery({
    queryKey: ['publicLocation', lid],
    queryFn: () => api.get<PublicLocation>(`/business/participating/locations/${lid}`).then(r => r.data).catch(() => null),
    enabled: !!lid,
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Already signed in? Skip the pitch and go straight to the receipt flow for this location.
  if (isAuthenticated) return <Navigate to={lid ? `/scan?l=${lid}` : '/scan'} replace />;
  // No location id - nothing to personalize, fall back to the normal landing.
  if (!lid) return <Navigate to="/" replace />;

  const prize = loc?.draw_prize_amount ?? null;

  return (
    <WelcomeInvite
      brandHeadline={<>One step from<br />this month&apos;s draw.</>}
      brandTagline={
        loc?.business_name
          ? `You scanned a flyer from ${loc.business_name}. Create your free account to submit your receipt and join the draw.`
          : 'You scanned a flyer. Create your free account to submit your receipt and join the draw.'
      }
      headline={loc?.business_name ? `Welcome to ${loc.business_name}` : 'Welcome to Winnbell'}
      headerSubline="Create your account to claim your welcome entry."
      steps={[
        {
          icon: <ReceiptLongOutlined />,
          title: 'Submit your receipt',
          text: loc?.business_name
            ? `Type in your receipt from ${loc.business_name} to earn your entries.`
            : 'Type in your receipt from your visit to earn your entries.',
          tint: ALPHA_PRIMARY_10,
          iconColor: PRIMARY_MAIN,
        },
        {
          icon: <EmojiEventsOutlined />,
          title: 'Enter the monthly draw',
          text: prize
            ? `Every entry competes for this month's ${formatCurrency(prize)} cash prize.`
            : "Every entry competes for this month's cash prize.",
          tint: ACCENT_GOLD_LIGHT,
          iconColor: ACCENT_GOLD_DARK,
        },
        {
          icon: <CardGiftcardOutlined />,
          title: 'Always free to play',
          text: 'No purchase is ever necessary. Every member can claim a weekly entry in the app.',
          tint: ALPHA_GREEN_10,
          iconColor: STATUS_ACTIVATED_TEXT,
        },
      ]}
    />
  );
};

export default ScanWelcomePage;
