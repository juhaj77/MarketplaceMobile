import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Prefer EXPO_PUBLIC_API_BASE_URL, fallback to dev localhost
const defaultBaseURL = 'http://localhost:4000/api';
let resolvedBaseURL = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || defaultBaseURL;

// If running on Android emulator and baseURL points to localhost, use 10.0.2.2
try {
  const url = new URL(resolvedBaseURL);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (Platform.OS === 'android' && isLocalhost) {
    url.hostname = '192.168.1.217'; // your computer local ip
    resolvedBaseURL = url.toString();
  }
} catch (_) {
  // keep original if parsing fails
}

// Create axios instance with a timeout so UI doesn't hang forever on bad networks
export const api = axios.create({ baseURL: resolvedBaseURL, timeout: 15000 });

// Attach token if available + lightweight dev logging
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    const url = api.getUri(config);
    // eslint-disable-next-line no-param-reassign
    config.metadata = { start: Date.now(), url, method: (config.method || 'GET').toUpperCase() };
    // eslint-disable-next-line no-console
    console.log(`[API] → ${config.metadata.method} ${url}`);
  }
  return config;
});

// Basic 401 handling + dev logging
api.interceptors.response.use(
  (res) => {
    if (__DEV__ && res.config?.metadata) {
      const { start, method, url } = res.config.metadata;
      const ms = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(`[API] ← ${method} ${url} ${res.status} ${ms}ms`);
    }
    return res;
  },
  async (error) => {
    if (__DEV__ && error.config) {
      const meta = error.config.metadata || {};
      const method = meta.method || (error.config.method || 'GET').toUpperCase();
      const url = meta.url || error.config.url || '(unknown)';
      const ms = meta.start ? `${Date.now() - meta.start}ms` : '';
      const status = error.response?.status || error.code || 'ERR';
      // eslint-disable-next-line no-console
      console.log(`[API] × ${method} ${url} ${status} ${ms} :: ${error.message}`);
    }
    if (error.response && error.response.status === 401) {
      // Do not delete token here. Let app-level auth logic handle 401 (e.g., show message, logout explicitly).
      // Deleting silently here can desync UI state and break subsequent authorized requests.
    }
    return Promise.reject(error);
  }
);

export default api;
