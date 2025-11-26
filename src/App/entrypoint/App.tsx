import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import classes from '@App/entrypoint/App.module.css';
import { AppHeader } from '@App/entrypoint/AppHeader';
import { AppMain } from '@App/entrypoint/AppMain';
import { AppNavbar } from '@App/entrypoint/AppNavbar';
import donatePay from '@components/Integration/DonatePay';
import { COLORS } from '@constants/color.constants';
import { RootState } from '@reducers';
import { setDonatePaySubscribeState } from '@reducers/Subscription/Subscription.ts';
import { useIsMobile } from '@shared/lib/ui';
import { userControllerGetUserOptions } from '@api/openapi/@tanstack/react-query.gen';

import { getIntegrationsValidity } from '../../api/userApi';
import { useActiveMenu, useMenuItems } from '../../constants/menuItems.constants';
import { connectToBroadcastingSocket } from '../../domains/broadcasting/lib/socket';
import { useLotsBroadcasting } from '../../domains/broadcasting/lib/useLotsBroadcasting';
import { AlertType, AlertTypeEnum } from '../../models/alert.model';
import { loadUserData, setAucSettings } from '../../reducers/AucSettings/AucSettings';
import { addAlert, deleteAlert } from '../../reducers/notifications/notifications';
import { connectToSocketIo } from '../../reducers/socketIo/socketIo';
import { getCookie } from '../../utils/common.utils';

import type { ThunkDispatch } from 'redux-thunk';

const hasToken = !!getCookie('userSession');

let openDriverTimeout: any;

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isHovered, setIsDrawerOpen] = useState(false);
  const { username } = useSelector((root: RootState) => root.user);
  const menuItems = useMenuItems();
  const activeMenu = useActiveMenu(menuItems);
  const isColorResetDone = useRef(localStorage.getItem('isColorResetDone') === 'true');

  const [isNavbarOpened, mobileNavbar] = useDisclosure();
  const isMobile = useIsMobile();

  if (!isColorResetDone.current && !hasToken) {
    localStorage.setItem('isColorResetDone', 'true');
    isColorResetDone.current = true;
    dispatch(setAucSettings({ primaryColor: COLORS.THEME.PRIMARY }));
  }

  const showDrawer = useCallback(() => {
    openDriverTimeout = setTimeout(() => setIsDrawerOpen(true), 70);
  }, []);
  const hideDrawer = useCallback(() => {
    clearTimeout(openDriverTimeout);
    setIsDrawerOpen(false);
  }, []);

  useLotsBroadcasting();

  useEffect(() => {
    if (username) {
      dispatch(connectToSocketIo);
      dispatch(connectToBroadcastingSocket);
    }
  }, [dispatch, username]);

  useEffect(() => {
    let interval: any;
    if (hasToken && username) {
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

  const userQuery = useQuery({
    ...userControllerGetUserOptions({}),
  });

  useEffect(() => {
    const loadUser = async () => {
      const loadingAlert: AlertType = {
        message: t('common.accountProgress'),
        type: AlertTypeEnum.Info,
        id: Math.random(),
      };

      dispatch(addAlert(loadingAlert));
      try {
        await loadUserData(dispatch);
      } finally {
        dispatch(deleteAlert(loadingAlert.id));
      }
    };

    if (hasToken) {
      loadUser();
    }
    // do not add t function to the deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    const unsub = donatePay.pubsubFlow.events.on('subscribed', () =>
      dispatch(setDonatePaySubscribeState({ actual: true })),
    );
    const unsub2 = donatePay.pubsubFlow.events.on('unsubscribed', () =>
      dispatch(setDonatePaySubscribeState({ actual: false })),
    );

    return () => {
      unsub();
      unsub2();
    };
  }, [dispatch]);

  const isNavbarExpanded = useMemo(() => {
    return (isHovered && activeMenu?.navbarFixedState !== 'closed') || activeMenu?.navbarFixedState === 'opened';
  }, [isHovered, activeMenu]);

  return (
    <AppShell
      padding={0}
      className={clsx(classes.app, {
        [classes.expanded]: isNavbarExpanded,
        [classes.fixedOpened]: activeMenu?.navbarFixedState === 'opened',
      })}
      header={{ height: { base: 50, sm: 0 } }}
      navbar={{ width: 61, breakpoint: 'sm', collapsed: { mobile: !isNavbarOpened } }}
      transitionDuration={isMobile ? 200 : 0}
    >
      <AppHeader isNavbarOpened={isNavbarOpened} toggleNavbar={mobileNavbar.toggle} activeMenu={activeMenu} t={t} />
      <AppNavbar
        menuItems={menuItems}
        activeMenu={activeMenu}
        isMobile={isMobile}
        closeNavbar={mobileNavbar.close}
        isNavbarExpanded={isNavbarExpanded}
        t={t}
        showDrawer={showDrawer}
        hideDrawer={hideDrawer}
      />
      <AppMain />
    </AppShell>
  );
};

export default App;
