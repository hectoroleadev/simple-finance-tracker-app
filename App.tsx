import React from 'react';
import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { AuthProvider } from './context/AuthContext';
import ReloadPrompt from './components/ReloadPrompt';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
        <ReloadPrompt />
      </AuthProvider>
    </HashRouter>
  );
};

export default App;