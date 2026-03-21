import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, refreshToken } from './features/auth/authSlice';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';

import Layout from './components/Layout';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Payments from './pages/Payments';
import DigitalCard from './pages/DigitalCard';
import Agreements from './pages/Agreements';
import ManageAgreements from './pages/ManageAgreements';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';
import Reports from './pages/Reports';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import PaymentPending from './pages/PaymentPending';
import TwoFactorLogin from './components/TwoFactorLogin';
import TwoFactorSetup from './components/TwoFactorSetup';
import PublicValidateCard from './pages/PublicValidateCard';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticação no carregamento da app
    // Não verificar se estiver nas páginas públicas
    const isPublicRoute = window.location.pathname === '/login' || 
                          window.location.pathname === '/register';
    
    if (!isPublicRoute) {
      const checkAuth = async () => {
        try {
          await dispatch(refreshToken()).unwrap();
          await dispatch(getProfile()).unwrap();
        } catch (error) {
          // Usuário não autenticado - silencioso
          console.log('Usuário não autenticado');
          navigate('/login', { replace: true });
        }
      };

      checkAuth();
    }
  }, [dispatch, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify-2fa" element={<TwoFactorLogin />} />
      <Route path="/public/validar/:token" element={<PublicValidateCard />} />
      <Route path="/register" element={<Register />} />

      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<PaymentPending />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleBasedRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings/2fa" element={<TwoFactorSetup />} />
        <Route path="payments" element={<Payments />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="digital-card" element={<DigitalCard />} />
        <Route path="agreements" element={<Agreements />} />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="admin"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <Admin />
            </RoleGuard>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="admin/agreements"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <ManageAgreements />
            </RoleGuard>
          }
        />
        <Route
          path="admin/reports"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <Reports />
            </RoleGuard>
          }
        />
        <Route
          path="admin/payments"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <AdminPayments />
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
