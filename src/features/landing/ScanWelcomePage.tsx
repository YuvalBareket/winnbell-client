import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LocationOn } from '@mui/icons-material';
import { api } from '../../shared/api/client';
import { useAppSelector } from '../../store/hook';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';
import WelcomeInvite from '../../shared/components/WelcomeInvite';
import { formatCurrency } from '../../shared/utils/date';
import { trackFunnel } from '../../shared/analytics/funnel';

// Conversion hero shown when a logged-out visitor scans a flyer QR (/start?l=<id>).
// Shares its layout with the referral JoinPage via WelcomeInvite; only the copy and
// steps differ. After sign-up, useSupabaseSync returns them to /scan?l=<id>.
interface PublicLocation {
  business_name: string;
  location_name: string;
  logo_url: string | null;
  min_transaction_amount: number | null;
  draw_prize_amount: number | null;
  draw_date: string | null;
}

const ScanWelcomePage = () => {
  const [searchParams] = useSearchParams();
  const lid = searchParams.get('l');
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Remember the location so that after sign-up the user lands back on /scan?l=<id>.
  useEffect(() => {
    if (lid) {
      try { localStorage.setItem('pendingLocationId', lid); } catch { /* storage unavailable (private mode) - signup still works, only the return-to-location hop is lost */ }
      trackFunnel('scan_landing_viewed', { locationId: Number(lid) || undefined });
    }
  }, [lid]);

  const { data: loc, isLoading: locLoading } = useQuery({
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
  const threshold = loc?.min_transaction_amount ?? null;
  const subline = threshold
    ? `Spent ${formatCurrency(threshold)} or more? Submit your receipt and collect your Winnbell entries. It only takes a moment.`
    : 'Submit your receipt and collect your Winnbell entries. It only takes a moment.';

  return (
    <WelcomeInvite
      contextChip={{
        icon: <LocationOn />,
        label: loc?.business_name ? `Scanned at ${loc.business_name}` : 'Scanned a Winnbell flyer',
      }}
      brandHeadline={<>You're already<br />shopping here.<br />Make it count.</>}
      brandTagline={
        loc?.business_name
          ? `You scanned a flyer from ${loc.business_name}. Create your free account, snap your receipt, and collect your Winnbell entries.`
          : 'You scanned a flyer. Create your free account, snap your receipt, and collect your Winnbell entries.'
      }
      leadClause={
        loc?.business_name
          ? `Your purchase at ${loc.business_name} could get you into the`
          : 'Your purchase could get you into the'
      }
      prizeAmount={prize}
      loading={locLoading}
      subtext={subline}
      steps={[
        'Sign up in seconds',
        'Snap your receipt to enter',
        'Claim your weekly entry on us',
      ]}
      ctaLabel="Get my entries!"
    />
  );
};

export default ScanWelcomePage;
