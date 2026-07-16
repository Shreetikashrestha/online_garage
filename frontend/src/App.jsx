import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout & UI
import MainLayout from './components/layout/MainLayout';
import Spinner from './components/ui/Spinner';

// Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import IdentityVerification from './pages/Auth/IdentityVerification';
import Vehicles from './pages/UserDashboard/Vehicles';
import Dashboard from './pages/UserDashboard/Dashboard';
import MechanicDashboard from './pages/MechanicDashboard/MechanicDashboard';
import BookingCreate from './pages/BookingFlow/BookingCreate';
import ProblemPicker from './pages/BookingFlow/ProblemPicker';
import MechanicResults from './pages/BookingFlow/MechanicResults';
import BookingSummary from './pages/BookingFlow/BookingSummary';
import PaymentOptions from './pages/BookingFlow/PaymentOptions';
import BookingConfirmed from './pages/BookingFlow/BookingConfirmed';
import Tracking from './pages/Tracking/Tracking';
import PartsCatalogue from './pages/Parts/PartsCatalogue';
import PartDetail from './pages/Parts/PartDetail';
import PartsCheckout from './pages/Parts/PartsCheckout';
import MechanicProfile from './pages/Mechanic/MechanicProfile';
import SOSEmergency from './pages/SOS/SOSEmergency';
import AccountSettings from './pages/Account/AccountSettings';
import Invoices from './pages/Account/Invoices';
import PaymentFailed from './pages/BookingFlow/PaymentFailed';

// Route guards
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'MECHANIC') return <Navigate to="/mechanic-dashboard" replace />;
    if (user.role === 'ADMIN')    return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

// Redirect already-authenticated users away from login/register
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'MECHANIC') return <Navigate to="/mechanic-dashboard" replace />;
    if (user.role === 'ADMIN')    return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div style={styles.loaderWrapper}>
        <Spinner size="lg" />
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
          Initializing OnlineGarage...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* User role specific routes */}
          <Route 
            path="/vehicles" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Vehicles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/create" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <BookingCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/problem" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <ProblemPicker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/mechanics" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <MechanicResults />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/summary" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <BookingSummary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/payment" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PaymentOptions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/confirmed" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <BookingConfirmed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tracking/:bookingId" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'MECHANIC', 'ADMIN']}>
                <Tracking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify-identity" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'MECHANIC']}>
                <IdentityVerification />
              </ProtectedRoute>
            } 
          />

          {/* Parts routes (public browsing, protected checkout) */}
          <Route path="/parts" element={<PartsCatalogue />} />
          <Route path="/parts/:id" element={<PartDetail />} />
          <Route 
            path="/parts/checkout" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PartsCheckout />
              </ProtectedRoute>
            } 
          />

          {/* Mechanic public profile */}
          <Route path="/mechanics/:id" element={<MechanicProfile />} />

          {/* SOS Emergency */}
          <Route path="/sos" element={<SOSEmergency />} />

          {/* Account pages */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'MECHANIC', 'ADMIN']}>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute allowedRoles={['USER', 'MECHANIC']}>
                <Invoices />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/booking/payment-failed" 
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <PaymentFailed />
              </ProtectedRoute>
            } 
          />

          {/* Mechanic role specific routes */}
          <Route 
            path="/mechanic-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['MECHANIC']}>
                <MechanicDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

const styles = {
  loaderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
};
