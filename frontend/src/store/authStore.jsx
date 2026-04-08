import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AUTH_STORAGE_KEY = 'fitai_auth';

const getSavedAuth = () => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

const saveAuth = (token, user) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
};

const clearSavedAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const setSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    saveAuth(nextToken, nextUser);
  };

  const clearSession = () => {
    setToken('');
    setUser(null);
    clearSavedAuth();
  };

  const fetchCurrentUser = async (sessionToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to validate user session');
    }

    return data.user;
  };

  useEffect(() => {
    const hydrateSession = async () => {
      const savedAuth = getSavedAuth();

      if (!savedAuth?.token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(savedAuth.token);
        setToken(savedAuth.token);
        setUser(currentUser);
        saveAuth(savedAuth.token, currentUser);
      } catch (error) {
        clearSession();
      } finally {
        setIsAuthLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const register = async ({ name, email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setSession(data.token, data.user);
    return data;
  };

  const login = async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setSession(data.token, data.user);
    return data;
  };

  const logout = () => {
    clearSession();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAuthLoading,
      register,
      login,
      logout,
    }),
    [token, user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
