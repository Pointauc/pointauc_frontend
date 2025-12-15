const TUTORIAL_COMPLETION_PREFIX = 'tutorial_completed_';
const TUTORIAL_DISMISSED_PREFIX = 'tutorial_dismissed_';

/**
 * Check if a tutorial has been completed
 */
export function isTutorialCompleted(tutorialId: string): boolean {
  const key = `${TUTORIAL_COMPLETION_PREFIX}${tutorialId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Mark a tutorial as completed
 */
export function markTutorialCompleted(tutorialId: string): void {
  const key = `${TUTORIAL_COMPLETION_PREFIX}${tutorialId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Reset tutorial completion status
 */
export function resetTutorialCompletion(tutorialId: string): void {
  const key = `${TUTORIAL_COMPLETION_PREFIX}${tutorialId}`;
  localStorage.removeItem(key);
}

/**
 * Check if a tutorial start prompt has been dismissed
 */
export function isTutorialDismissed(tutorialId: string): boolean {
  const key = `${TUTORIAL_DISMISSED_PREFIX}${tutorialId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Mark a tutorial start prompt as dismissed
 */
export function markTutorialDismissed(tutorialId: string): void {
  const key = `${TUTORIAL_DISMISSED_PREFIX}${tutorialId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Reset tutorial dismissed status
 */
export function resetTutorialDismissed(tutorialId: string): void {
  const key = `${TUTORIAL_DISMISSED_PREFIX}${tutorialId}`;
  localStorage.removeItem(key);
}

/**
 * Get all completed tutorial IDs
 */
export function getAllCompletedTutorials(): string[] {
  const completedTutorials: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TUTORIAL_COMPLETION_PREFIX) && localStorage.getItem(key) === 'true') {
      const tutorialId = key.replace(TUTORIAL_COMPLETION_PREFIX, '');
      completedTutorials.push(tutorialId);
    }
  }
  
  return completedTutorials;
}

/**
 * Clear all tutorial-related data
 */
export function clearAllTutorialData(): void {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(TUTORIAL_COMPLETION_PREFIX) || key?.startsWith(TUTORIAL_DISMISSED_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

