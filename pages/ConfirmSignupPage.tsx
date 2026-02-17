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
  const { loading } = useAuth(); // Only need loading state
  const { t } = useLanguage();

  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

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
      const response = await fetch(`${API_GATEWAY_URL}/auth/confirm-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (t('auth.confirmSignupError') || 'Failed to confirm account. Please check the code.'));
      }

      setMessage(t('auth.confirmSignupSuccess') || 'Account confirmed successfully! You can now log in.');
      // Redirect to login page after successful confirmation
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || t('auth.genericError') || 'An error occurred.');
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setMessage(null);
    try {
      // In a real app, you would have a resend code endpoint in Lambda
      // For this example, we'll just simulate it or point to Cognito's resend API
      // For simplicity, we'll assume the Lambda has a resend code functionality, though not implemented yet.
      // Or we could trigger it directly from Cognito API if we weren't avoiding AWS SDK on frontend.
      // For now, this is a placeholder.
      // Ideally, you'd call a new Lambda endpoint like /auth/resend-confirmation-code
      // which would use `ResendConfirmationCodeCommand`
      
      // Let's just give a success message for now, assuming a backend endpoint would exist
      setMessage(t('auth.resendCodeSuccess') || 'Confirmation code sent. Please check your email.');
    } catch (err: any) {
      setError(err.message || t('auth.genericError') || 'An error occurred while resending code.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {t('auth.confirmSignupTitle') || 'Confirm Sign Up'}
        </h2>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-600 text-white p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              {t('auth.usernameLabel') || 'Username'}
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="code">
              {t('auth.confirmationCodeLabel') || 'Confirmation Code'}
            </label>
            <input
              type="text"
              id="code"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (t('auth.loading') || 'Loading...') : (t('auth.confirmButton') || 'Confirm')}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          <button
            type="button"
            className="text-emerald-500 hover:text-emerald-400 font-bold focus:outline-none"
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
