import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();
  const { t } = useLanguage();

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
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {isLoginMode ? (t('auth.loginTitle') || 'Login') : (t('auth.signupTitle') || 'Sign Up')}
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
            />
          </div>
          {!isLoginMode && (
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                {t('auth.emailLabel') || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              {t('auth.passwordLabel') || 'Password'}
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (t('auth.loading') || 'Loading...') : (isLoginMode ? (t('auth.loginButton') || 'Login') : (t('auth.signupButton') || 'Sign Up'))}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          {isLoginMode ? (t('auth.noAccount') || "Don't have an account?") : (t('auth.haveAccount') || "Already have an account?")}{' '}
          <button
            type="button"
            className="text-emerald-500 hover:text-emerald-400 font-bold focus:outline-none"
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
