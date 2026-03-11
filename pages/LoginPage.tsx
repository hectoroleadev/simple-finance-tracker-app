import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);


  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const { t } = useLanguage();
  const { state: { theme }, dispatch } = useTheme();

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      if (isLoginMode) {
        await login(username, password);
        navigate('/dashboard'); // Redirect to dashboard on successful login
      } else {
        await signup(username, password, email);
        navigate('/confirm-signup', { state: { username } }); // Redirect to confirm page
      }
    } catch (err: any) {
      setError(err.message || t('auth.genericError') || 'An error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* App Branding */}
      <div className="flex flex-col items-center mb-6 text-center animate-fade-in mt-4">
        <div className="bg-slate-900 dark:bg-slate-700 p-2.5 rounded-2xl shadow-xl mb-4 ring-4 ring-slate-100 dark:ring-slate-800/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
          {t('appTitle')}<span className="text-slate-400 font-medium">{t('appTitleCore')}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-[0.2em] text-[10px]">
          {t('appDescription')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 transition-all">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          {isLoginMode ? (t('auth.loginTitle') || 'Login') : (t('auth.signupTitle') || 'Sign Up')}
        </h2>

        {error && (
          <div ref={errorRef} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" htmlFor="username">
              {t('auth.usernameLabel') || 'Username'}
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {!isLoginMode && (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" htmlFor="email">
                {t('auth.emailLabel') || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" htmlFor="password">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 transition-all transform active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (t('auth.loading') || 'Loading...') : (isLoginMode ? (t('auth.loginButton') || 'Login') : (t('auth.signupButton') || 'Sign Up'))}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          {isLoginMode ? (t('auth.noAccount') || "Don't have an account?") : (t('auth.haveAccount') || "Already have an account?")}{' '}
          <button
            type="button"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none ml-1"
            onClick={() => setIsLoginMode(!isLoginMode)}
            disabled={loading}
          >
            {isLoginMode ? (t('auth.signupLink') || 'Sign Up') : (t('auth.loginLink') || 'Login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
