import { store } from '@store';

export const LAST_ACTIVE_USER_ID_STORAGE_KEY = 'pointauc_last_active_user_id';
export const ANONYMOUS_USER_ID = 'anonymous';

export const getLastActiveUserId = (): string | null => {
  try {
    return localStorage.getItem(LAST_ACTIVE_USER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setLastActiveUserId = (userId: string): void => {
  try {
    localStorage.setItem(LAST_ACTIVE_USER_ID_STORAGE_KEY, userId);
  } catch {
    // ignore local storage errors in sandbox/incognito
  }
};

export const getActiveUserId = (): string => {
  try {
    const state = store.getState();
    const user = state.user;
    const currentUserId = user?.pointaucUserId ?? user?.userId;

    if (currentUserId) {
      const stringId = String(currentUserId);
      setLastActiveUserId(stringId);
      return stringId;
    }
  } catch {
    // store may not be initialized in some test contexts
  }

  const lastActive = getLastActiveUserId();
  return lastActive || ANONYMOUS_USER_ID;
};

export const isUserLoggedIn = (): boolean => {
  try {
    const state = store.getState();
    const user = state.user;
    return Boolean(user?.pointaucUserId ?? user?.userId);
  } catch {
    return false;
  }
};
