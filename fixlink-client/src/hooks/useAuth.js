import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export function useAuth() {
  const { token, user, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.login({ email, password });
      const { token: t, ...userInfo } = data.data;
      setAuth(t, userInfo);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (email, password, displayName) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.register({ email, password, displayName });
      const { token: t, ...userInfo } = data.data;
      setAuth(t, userInfo);
      return true;
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  return { token, user, loading, error, login, register, logout };
}
