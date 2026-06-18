import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, refreshToken } from '../api/auth';
import { getMe } from '../api/users';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMe();
        setUser(data);
      } catch (err) {
        // Try to refresh the token
        try {
          const { data } = await refreshToken();
          sessionStorage.setItem('accessToken', data.accessToken);
          const meRes = await getMe();
          setUser(meRes.data);
        } catch {
          sessionStorage.removeItem('accessToken');
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await loginUser({ email, password });
      sessionStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    setError(null);
    try {
      const { data } = await registerUser({ username, email, password });
      sessionStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Continue logout even if API call fails
    } finally {
      sessionStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, updateUser, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
