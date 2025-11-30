import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('token');
        if (stored) setToken(stored);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const payload = { email: String(email).trim().toLowerCase(), password };
    const res = await api.post('/auth/login', payload);
    const t = res.data?.token;
    if (t) {
      setToken(t);
      await SecureStore.setItemAsync('token', t);
    }
    if (res.data?.user) setUser(res.data.user);
    return res.data;
  };

  const register = async (displayName, email, password) => {
    const payload = {
      displayName: String(displayName).trim(),
      email: String(email).trim().toLowerCase(),
      password,
    };
    // Try to register first
    const res = await api.post('/auth/register', payload);
    // Some APIs do not return token on register; if no token, perform login
    let t = res.data?.token;
    let u = res.data?.user ?? null;
    if (!t) {
      const loginRes = await api.post('/auth/login', { email: payload.email, password });
      t = loginRes.data?.token;
      u = loginRes.data?.user ?? u;
    }
    if (t) {
      setToken(t);
      await SecureStore.setItemAsync('token', t);
    }
    if (u) setUser(u);
    return { token: t, user: u };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('token');
  };

  const value = useMemo(() => ({ user, token, login, register, logout, loading }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
