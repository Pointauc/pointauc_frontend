import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { getIntegrationsValidity } from '@api/userApi';
import { COLORS } from '@constants/color.constants';
import { loadUserData, setAucSettings } from '@reducers/AucSettings/AucSettings';
import { getCookie } from '@utils/common.utils';
import { isBrowser } from '@utils/ssr';
import { RootState } from '@reducers/index';

export const hasUserToken = isBrowser && !!getCookie('userSession');

export const useInitializeUser = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const { username } = useSelector((root: RootState) => root.user);
  const isColorResetDone = useRef(localStorage.getItem('isColorResetDone') === 'true');
  if (!isColorResetDone.current && !hasUserToken) {
    localStorage.setItem('isColorResetDone', 'true');
    isColorResetDone.current = true;
    dispatch(setAucSettings({ primaryColor: COLORS.THEME.PRIMARY }));
  }

  useEffect(() => {
    let interval: any;
    if (hasUserToken && username) {
      interval = setInterval(
        () => {
          getIntegrationsValidity();
        },
        1000 * 60 * 60 * 3,
      );
    }

    return (): void => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [username]);

  useEffect(() => {
    const loadUser = async () => {
      await loadUserData(dispatch);
    };

    if (hasUserToken) {
      loadUser();
    }
  }, [dispatch]);
};
