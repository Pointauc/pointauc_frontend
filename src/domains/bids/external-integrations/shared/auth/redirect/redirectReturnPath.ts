import ROUTES from '@constants/routes.constants';
import * as Integration from '@models/integration';

const getRedirectReturnPathStorageKey = (id: Integration.ID): string => `${id}_redirectReturnPath`;

const checkIsRedirectPath = (path: string): boolean => /^\/[^/]+\/redirect(?:[?#].*)?$/.test(path);

const checkIsSafeReturnPath = (path: string): boolean =>
  path.startsWith('/') && !path.startsWith('//') && !checkIsRedirectPath(path);

export const saveRedirectReturnPath = (id: Integration.ID): void => {
  const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (!checkIsSafeReturnPath(returnPath)) {
    return;
  }

  sessionStorage.setItem(getRedirectReturnPathStorageKey(id), returnPath);
};

export const consumeRedirectReturnPath = (id: Integration.ID): string => {
  const storageKey = getRedirectReturnPathStorageKey(id);
  const returnPath = sessionStorage.getItem(storageKey);

  sessionStorage.removeItem(storageKey);

  if (!returnPath || !checkIsSafeReturnPath(returnPath)) {
    return ROUTES.HOME;
  }

  return returnPath;
};
