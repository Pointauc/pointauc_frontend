import { app } from 'electron';

export interface DesktopEnvironment {
  backendOrigin: string;
  publicOrigin: string;
}

const DEFAULT_ORIGIN = 'https://pointauc.com';

const normalizeHttpOrigin = (variableName: string, rawValue: string | undefined): string => {
  const trimmedValue = rawValue?.trim();
  if (!trimmedValue) {
    return DEFAULT_ORIGIN;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error(`Unsupported protocol for ${variableName}: ${parsedUrl.protocol}`);
    }

    return parsedUrl.origin;
  } catch {
    throw new Error(`Invalid environment variable: ${variableName}`);
  }
};

export const checkIsSmoke = (): boolean => {
  return process.env.DESKTOP_SMOKE === '1';
};

export const checkIsDev = (): boolean => {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (typeof app !== 'undefined' && app && typeof app.isPackaged === 'boolean') {
    return !app.isPackaged;
  }

  return process.env.NODE_ENV !== 'production';
};

export const readDesktopEnvironment = (): DesktopEnvironment => {
  const backendOrigin = normalizeHttpOrigin('DESKTOP_BACKEND_ORIGIN', process.env.DESKTOP_BACKEND_ORIGIN);
  const publicOrigin = normalizeHttpOrigin('DESKTOP_PUBLIC_ORIGIN', process.env.DESKTOP_PUBLIC_ORIGIN);

  return {
    backendOrigin,
    publicOrigin,
  };
};

export const readBackendOrigin = (): string => {
  return normalizeHttpOrigin('DESKTOP_BACKEND_ORIGIN', process.env.DESKTOP_BACKEND_ORIGIN);
};

export const readPublicOrigin = (): string => {
  return normalizeHttpOrigin('DESKTOP_PUBLIC_ORIGIN', process.env.DESKTOP_PUBLIC_ORIGIN);
};
