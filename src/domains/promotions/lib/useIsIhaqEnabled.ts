import { useSelector } from 'react-redux';
import { useStore } from '@tanstack/react-store';

import ihaq from '@domains/bids/external-integrations/ihaq/lib/integrationScheme';
import { RootState } from '@reducers';
import { getCookie } from '@utils/common.utils';
import { isBrowser } from '@utils/ssr';

export const selectIsIhaqAuthValid = (state: RootState): boolean => {
  const ihaqAuth = state.user.authData?.ihaq;
  if (!ihaqAuth) {
    return false;
  }
  return ihaqAuth.isValid !== false;
};

export const checkIsIhaqEnabled = (state: RootState): boolean => {
  const isAuthValid = selectIsIhaqAuthValid(state);
  const isSubscribed = Boolean(ihaq.pubsubFlow?.store?.state?.subscribed);
  return isAuthValid || isSubscribed;
};

export const selectIsUserAuthLoading = (state: RootState): boolean => {
  const hasUserToken = isBrowser && Boolean(getCookie('userSession'));
  return hasUserToken && !state.user.username;
};

export const useIsUserAuthLoading = (): boolean => {
  return useSelector(selectIsUserAuthLoading);
};

export const useIsIhaqEnabled = (): boolean => {
  const isAuthValid = useSelector(selectIsIhaqAuthValid);
  const isSubscribed = useStore(ihaq.pubsubFlow.store, (s) => Boolean(s.subscribed));

  return isAuthValid || isSubscribed;
};
