import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { getIntegrationsValidity } from '@api/userApi';
import { COLORS } from '@constants/color.constants';
import { loadAppSettings } from '@shared/lib/database/appSettingsDb';
import { loadUserData, setAucSettings } from '@reducers/AucSettings/AucSettings';
import { getCookie } from '@utils/common.utils';
import { isBrowser } from '@utils/ssr';
import { RootState } from '@reducers/index';

export const checkHasUserToken = (): boolean => isBrowser && Boolean(getCookie('userSession'));
export const hasUserToken = isBrowser && !!getCookie('userSession');

export const useInitializeUser = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const { username } = useSelector((root: RootState) => root.user);
  const isColorResetDone = useRef(localStorage.getItem('isColorResetDone') === 'true');
  if (!isColorResetDone.current && !checkHasUserToken()) {
    localStorage.setItem('isColorResetDone', 'true');
    isColorResetDone.current = true;
    dispatch(setAucSettings({ primaryColor: COLORS.THEME.PRIMARY }));
  }

  useEffect(() => {
    let isCancelled = false;

    const loadLocalSettings = async () => {
      try {
        const appSettings = await loadAppSettings();

        if (!isCancelled && appSettings.background !== undefined) {
          dispatch(setAucSettings({ background: appSettings.background }));
        }
      } catch (err) {
        console.error('Failed to load app settings from IndexedDB', err);
      }
    };

    loadLocalSettings();

    return (): void => {
      isCancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    let interval: any;
    if (checkHasUserToken() && username) {
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
      await dispatch(loadUserData());
    };

    if (checkHasUserToken()) {
      loadUser();
    }
  }, [dispatch]);
};
