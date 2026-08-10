import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import { fetchRegionCheck, REGION_CHECK_STALE_TIME } from '../api/regionCheck';
import { queryKeys } from '../constants/queryKeys';
import LoadingScreen from './LoadingScreen';
import RegionBlockedContent from './RegionBlockedContent';
import AppPageHero from './AppPageHero';

interface Props {
  children: React.ReactNode;
  /** Render children while the check is in flight instead of a LoadingScreen, redirecting
   *  or swapping only on a KNOWN block. Use on everyday in-app pages (e.g. /scan, the main
   *  authed landing page) where a blocking loader on every cold load would tax all
   *  legitimate users to catch the rare blocked visitor. Signup keeps the blocking default
   *  so a blocked visitor never sees a flash of the register form. */
  defer?: boolean;
  /** On block, render the blocked message IN PLACE of children (keeping the app shell and
   *  navigation around it) instead of redirecting to the standalone /region-blocked page.
   *  Use inside authed layouts - throwing a signed-in user out to a bare public page
   *  strands them with no way back to the rest of the app. */
  inline?: boolean;
  /** Hero title for the inline blocked state. Authed pages render their own AppPageHero
   *  (the mobile brand/menu band), so the swapped-in blocked view must render one too or
   *  the app header disappears with the page content. */
  heroTitle?: string;
}

/** Region gate: only the platform's approved states pass (server decides via IP geo). */
const RegionGate = ({ children, defer = false, inline = false, heroTitle }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.region.check,
    queryFn: fetchRegionCheck,
    staleTime: REGION_CHECK_STALE_TIME,
    retry: false,
  });

  if (isLoading && !defer) return <LoadingScreen />;
  if (data?.blocked) {
    if (!inline) return <Navigate to='/region-blocked' replace />;
    return (
      <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', pb: { xs: 12, md: 6 }, overflowX: 'clip' }}>
        <AppPageHero title={heroTitle} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 8 }}>
          <RegionBlockedContent />
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
};

export default RegionGate;
