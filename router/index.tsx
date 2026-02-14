
import React, { Suspense, lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import DashboardPage from '../pages/DashboardPage';
import Loading from '../components/Loading';

// Lazy load secondary pages
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const AnalysisPage = lazy(() => import('../pages/AnalysisPage'));

export const router = createHashRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { 
        path: "history", 
        element: (
          <Suspense fallback={<Loading />}>
            <HistoryPage />
          </Suspense>
        ) 
      },
      { 
        path: "charts", 
        element: (
          <Suspense fallback={<Loading />}>
            <AnalysisPage />
          </Suspense>
        ) 
      },
    ],
  },
]);
