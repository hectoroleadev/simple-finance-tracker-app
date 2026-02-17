
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// Lazy load all pages
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const AnalysisPage = lazy(() => import('../pages/AnalysisPage'));
const LoginPage = lazy(() => import('../pages/LoginPage')); // Lazy load LoginPage
const ConfirmSignupPage = lazy(() => import('../pages/ConfirmSignupPage')); // Lazy load ConfirmSignupPage

export const AppRoutes = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <RootLayout><Loading /></RootLayout>; // Show loading while auth state is being determined
  }

  return (
    <RootLayout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirm-signup" element={<ConfirmSignupPage />} />
          
          {isLoggedIn ? (
            <>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/charts" element={<AnalysisPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          ) : (
            <>
              {/* Redirect any protected route access to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </RootLayout>
  );
};
