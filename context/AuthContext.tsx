import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string; email?: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email: string) => Promise<void>;
  logout: () => void;
  getIdToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

  useEffect(() => {
    // Attempt to load tokens from localStorage on mount
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      // Basic check if tokens are still valid (e.g., by checking expiry or just presence)
      if (parsedTokens.idToken && parsedTokens.accessToken && parsedTokens.refreshToken) {
        setTokens(parsedTokens);
        setIsLoggedIn(true);
        // Optionally decode ID token to get user info if needed
        const decodedToken = decodeJwt(parsedTokens.idToken);
        if (decodedToken) {
          setUser({
            username: decodedToken['cognito:username'] || decodedToken.username || 'User',
            email: decodedToken.email,
          });
        }
      }
    }
    setLoading(false);
  }, []);

  const saveTokens = (newTokens: AuthTokens) => {
    setTokens(newTokens);
    localStorage.setItem('authTokens', JSON.stringify(newTokens));
  };

  const clearTokens = () => {
    setTokens(null);
    localStorage.removeItem('authTokens');
  };

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const result = await response.json();
      const newTokens: AuthTokens = {
        idToken: result.IdToken,
        accessToken: result.AccessToken,
        refreshToken: result.RefreshToken,
      };
      saveTokens(newTokens);
      setIsLoggedIn(true);
      const decodedToken = decodeJwt(newTokens.idToken);
      if (decodedToken) {
        setUser({
          username: decodedToken['cognito:username'] || decodedToken.username || username,
          email: decodedToken.email,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [API_GATEWAY_URL]);

  const signup = useCallback(async (username, password, email) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_GATEWAY_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      // Signup usually requires email confirmation, so no tokens are returned yet
      // User will need to confirm email and then login
      // For now, just indicate success
      return await response.json(); // May contain user confirmation info
    } finally {
      setLoading(false);
    }
  }, [API_GATEWAY_URL]);

  const logout = useCallback(() => {
    clearTokens();
    setIsLoggedIn(false);
    setUser(null);
    // Optionally redirect to login page
  }, []);

  const getIdToken = useCallback(() => {
    return tokens?.idToken || null;
  }, [tokens]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, signup, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to decode JWT token
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
