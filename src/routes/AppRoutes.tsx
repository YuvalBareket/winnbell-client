import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hook';
import {
  selectIsRegularUser,
  selectIsBusiness,
  selectIsLocationManager,
} from '../store/selectors/authSelectors';

import MainLayout from '../shared/components/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Common/Auth
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// User Specific
import NearbyPage from '../features/nearBy/pages/NearbyPage';
import RedeemPage from '../features/tickets/pages/RedeemPage';
import MyTicketsPage from '../features/myTickets/pages/MyTicketsPage';
import FreeTicketPage from '../features/tickets/pages/FreeTicketPage';

// Business/Admin Specific
import BusinessDashboard from '../features/admin/pages/BusinessDashboard';
import BusinessProfilePage from '../features/partner/pages/BusinessProfilePage';
import BusinessHubPage from '../features/partner/pages/BusinessHubPage';

const AppRoutes = () => {
  const isUser = useAppSelector(selectIsRegularUser);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register/:role?' element={<RegisterPage />} />

      {/* --- Protected Routes --- */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* TAB 1 (LEFT): 
              User & Location Manager see the Map. 
              Business Owner (Admin) sees their Profile/Settings.
          */}
          <Route
            path='/nearby'
            element={isBusinessAdmin ? <BusinessHubPage /> : <NearbyPage />}
          />

          {/* TAB 2 (MIDDLE): 
              The "Action" Page. 
              Users Redeem. Business (Manager & Admin) Issue Tickets.
          */}
          <Route path='/' element={<RedeemPage />} />

          {/* TAB 3 (RIGHT): 
              Users see personal history. 
              Location Manager sees Branch stats.
              Admin sees the Global Dashboard.
          */}
          <Route path='/tickets' element={<MyTicketsPage />} />
        </Route>

        {/* User-only bonus page */}
        {isUser && <Route path='/freeTicket' element={<FreeTicketPage />} />}
      </Route>

      {/* Fallback */}
      <Route path='*' element={<Navigate to='/login' replace />} />
    </Routes>
  );
};

export default AppRoutes;
