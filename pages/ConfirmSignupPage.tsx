import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ConfirmSignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { loading, confirmSignup, resendConfirmationCode } = useAuth();
  const { t } = useLanguage();

  // Pre-fill username if available from signup page state
  useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await confirmSignup(username, code);

      setMessage(t('auth.confirmSignupSuccess') || 'Account confirmed successfully! You can now log in.');
      // Redirect to login page after successful confirmation
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || t('auth.confirmSignupError') || 'Failed to confirm account. Please check the code.');
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setMessage(null);
    try {
      await resendConfirmationCode(username);
      setMessage(t('auth.resendCodeSuccess') || 'Confirmation code sent. Please check your email.');
    } catch (err: any) {
      setError(err.message || t('auth.genericError') || 'An error occurred while resending code.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700 transition-all">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          {t('auth.confirmSignupTitle') || 'Confirm Sign Up'}
        </h2>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-2">
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1.5" htmlFor="code">
              {t('auth.confirmationCodeLabel') || 'Confirmation Code'}
            </label>
            <input
              type="text"
              id="code"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 transition-all transform active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (t('auth.loading') || 'Loading...') : (t('auth.confirmButton') || 'Confirm')}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
          {t('auth.didntReceiveCode') || "Didn't receive the code?"}{' '}
          <button
            type="button"
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline focus:outline-none ml-1"
            onClick={handleResendCode}
            disabled={loading}
          >
            {t('auth.resendCode') || 'Resend Code'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ConfirmSignupPage;
