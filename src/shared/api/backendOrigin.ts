const BACKEND_API_PATH = '/api';

const getConfiguredBackendOrigin = (): string => import.meta.env.VITE_BACKEND_ORIGIN?.trim() ?? '';

export const getBackendOrigin = (): string | undefined => {
  const configuredBackendOrigin = getConfiguredBackendOrigin();

  if (!configuredBackendOrigin) {
    return undefined;
  }

  try {
    const parsedBackendOrigin = new URL(configuredBackendOrigin).origin;

    return parsedBackendOrigin === 'null' ? configuredBackendOrigin.replace(/\/+$/, '') : parsedBackendOrigin;
  } catch {
    return configuredBackendOrigin.replace(/\/+$/, '');
  }
};

export const getBackendApiBaseUrl = (): string => {
  const backendOrigin = getBackendOrigin();

  return backendOrigin ? `${backendOrigin}${BACKEND_API_PATH}` : BACKEND_API_PATH;
};

export const checkIsBackendApiUrl = (url: string): boolean => {
  if (url.startsWith(BACKEND_API_PATH)) {
    return true;
  }

  try {
    const backendOrigin = getBackendOrigin();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
    const requestUrl = new URL(url, currentOrigin ?? backendOrigin);

    if (!requestUrl.pathname.startsWith(BACKEND_API_PATH)) {
      return false;
    }

    return requestUrl.origin === currentOrigin || requestUrl.origin === backendOrigin;
  } catch {
    return false;
  }
};

export const resolveBackendApiUrl = (url: string): string => {
  const backendOrigin = getBackendOrigin();

  if (!backendOrigin || !checkIsBackendApiUrl(url)) {
    return url;
  }

  const requestUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : backendOrigin);

  return `${backendOrigin}${requestUrl.pathname}${requestUrl.search}${requestUrl.hash}`;
};
