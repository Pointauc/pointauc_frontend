import { matchPath } from 'react-router-dom';

import { getHotkeyDefinition } from './hotkeys.registry';

import type { HotkeyActionId } from './hotkeys.types';

const checkIsPathMatchingPattern = (pathname: string, pattern: string): boolean => {
  return matchPath({ path: pattern, end: !pattern.endsWith('*') }, pathname) !== null;
};

export const checkIsHotkeyActionEnabledOnPath = (actionId: HotkeyActionId, pathname: string): boolean => {
  const { enabledRoutes } = getHotkeyDefinition(actionId);

  if (!enabledRoutes?.length) {
    return true;
  }

  return enabledRoutes.some((pattern) => checkIsPathMatchingPattern(pathname, pattern));
};

export const checkIsHotkeyVisibleOnPath = (pathname: string, visibleOnRoutes?: string[]): boolean => {
  if (!visibleOnRoutes?.length) {
    return true;
  }

  return visibleOnRoutes.some((pattern) => checkIsPathMatchingPattern(pathname, pattern));
};
