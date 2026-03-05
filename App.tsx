import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { AuthProvider } from './context/AuthContext';
import ReloadPrompt from './components/ReloadPrompt';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
          <ReloadPrompt />
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;