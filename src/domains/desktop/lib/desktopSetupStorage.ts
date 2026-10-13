export const DESKTOP_SETUP_COMPLETED_KEY = 'desktop_setup_completed';

export const checkIsDesktopSetupCompleted = (): boolean => {
  try {
    return localStorage.getItem(DESKTOP_SETUP_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markDesktopSetupCompleted = (): void => {
  try {
    localStorage.setItem(DESKTOP_SETUP_COMPLETED_KEY, 'true');
  } catch {
    // Storage access might be restricted
  }
};

export const resetDesktopSetup = (): void => {
  try {
    localStorage.removeItem(DESKTOP_SETUP_COMPLETED_KEY);
  } catch {
    // Storage access might be restricted
  }
};
