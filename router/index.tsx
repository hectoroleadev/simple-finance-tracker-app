
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import DashboardPage from '../pages/DashboardPage';
import Loading from '../components/Loading';

// Lazy load secondary pages
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const AnalysisPage = lazy(() => import('../pages/AnalysisPage'));

export const AppRoutes = () => (
  <RootLayout>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/charts" element={<AnalysisPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </RootLayout>
);
