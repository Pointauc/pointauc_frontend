const WELCOME_SEEN_KEY = 'overlays_welcome_seen';

/**
 * Check if the welcome modal has been seen
 */
export function hasSeenWelcome(): boolean {
  return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
}

/**
 * Mark the welcome modal as seen
 */
export function markWelcomeSeen(): void {
  localStorage.setItem(WELCOME_SEEN_KEY, 'true');
}

/**
 * Reset onboarding state (for testing purposes)
 */
export function resetOnboardingState(): void {
  localStorage.removeItem(WELCOME_SEEN_KEY);
}

