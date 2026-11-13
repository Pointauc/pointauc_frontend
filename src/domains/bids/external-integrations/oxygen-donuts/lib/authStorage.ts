import type { IntegrationDataDto } from '@models/user.model.ts';

// This module is imported by the reducers, so it must not import the store or anything that depends on it.

const ACCESS_TOKEN_KEY = 'oxygenDonuts_authToken';
const PROFILE_KEY = 'oxygenDonuts_profile';

export interface OxygenDonutsProfile {
  id: string;
  username: string;
}

export const loadAccessToken = (): string => localStorage.getItem(ACCESS_TOKEN_KEY) ?? '';

const loadProfile = (): OxygenDonutsProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  if (!data) return null;

  try {
    const profile = JSON.parse(data) as Partial<OxygenDonutsProfile> | null;
    if (typeof profile?.id !== 'string' || typeof profile.username !== 'string') return null;

    return { id: profile.id, username: profile.username };
  } catch {
    return null;
  }
};

export const storeAuth = (accessToken: string, profile: OxygenDonutsProfile): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const clearAuth = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
};

export const validateOxygenDonuts = (): boolean => !!loadAccessToken();

/**
 * The access token stays in localStorage only: nothing in the app needs it in the Redux state.
 */
export const getOxygenDonutsAuthData = (): IntegrationDataDto | undefined => {
  const profile = loadProfile();

  if (!profile || !loadAccessToken()) return undefined;

  return { ...profile, isValid: true };
};
