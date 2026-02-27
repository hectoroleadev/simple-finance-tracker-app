
import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
// Register PWA Service Worker (handled by ReloadPrompt component now)
// We just leave the import to ensure Vite bundles it appropriately if needed elsewhere
// The actual registration UI logic is inside Components/ReloadPrompt.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
