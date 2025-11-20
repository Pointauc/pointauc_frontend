import axios, { InternalAxiosRequestConfig } from 'axios';

/**
 * Check if the URL is for our backend API
 */
const isBackendRequest = (url: string): boolean => {
  // If it's a relative URL starting with /api, it's our backend
  if (url.startsWith('/api')) {
    return true;
  }

  // If it's an absolute URL, check if it's pointing to our backend
  try {
    const requestUrl = new URL(url);
    const currentUrl = new URL(window.location.href);

    // Same origin requests to /api paths
    if (requestUrl.origin === currentUrl.origin && requestUrl.pathname.startsWith('/api')) {
      return true;
    }
  } catch {
    // Invalid URL, assume it's relative and let axios handle it
    return url.startsWith('/api');
  }

  return false;
};

/**
 * Request interceptor to add Bearer token to backend requests
 */
const requestInterceptor = (config: InternalAxiosRequestConfig, token: string): InternalAxiosRequestConfig => {
  // Only add token if it exists and this is a backend request
  if (token && config.url && isBackendRequest(config.url)) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
};

/**
 * Configure axios interceptors
 */
export const setupAxiosTokenInterceptor = (token: string): void => {
  // Add request interceptor
  axios.interceptors.request.use(
    (config) => requestInterceptor(config, token),
    (error) => Promise.reject(error),
  );
};
