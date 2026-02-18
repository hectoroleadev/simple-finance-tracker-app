import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

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
  confirmSignup: (username: string, code: string) => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<void>;
  logout: () => void;
  getIdToken: () => string | null;
  refreshAuthTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const setAuthData = useCallback((session: CognitoUserSession, username: string) => {
    const idToken = session.getIdToken().getJwtToken();
    const accessToken = session.getAccessToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();

    setTokens({ idToken, accessToken, refreshToken });
    setIsLoggedIn(true);

    const payload = session.getIdToken().decodePayload();
    setUser({
      username: payload['cognito:username'] || payload.username || username,
      email: payload.email,
    });
  }, []);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }
        setAuthData(session, cognitoUser.getUsername());
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [setAuthData]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setAuthData(session, username);
          setLoading(false);
          resolve();
        },
        onFailure: (err) => {
          setLoading(false);
          reject(err);
        },
      });
    });
  }, [setAuthData]);

  const signup = useCallback(async (username, password, email) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
      ];

      userPool.signUp(username, password, attributeList, [], (err, result) => {
        setLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }, []);

  const confirmSignup = useCallback(async (username, code) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        setLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }, []);

  const resendConfirmationCode = useCallback(async (username) => {
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        setLoading(false);
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }, []);

  const logout = useCallback(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setTokens(null);
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const getIdToken = useCallback(() => {
    return tokens?.idToken || null;
  }, [tokens]);

  const refreshAuthTokens = useCallback(async (): Promise<boolean> => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) return false;

    return new Promise<boolean>((resolve) => {
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          logout();
          resolve(false);
          return;
        }
        setAuthData(session, cognitoUser.getUsername());
        resolve(true);
      });
    });
  }, [logout, setAuthData]);

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      loading,
      login,
      signup,
      confirmSignup,
      resendConfirmationCode,
      logout,
      getIdToken,
      refreshAuthTokens
    }}>
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
