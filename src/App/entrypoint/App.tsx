import { Alert, Anchor, AppShell, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import classes from '@App/entrypoint/App.module.css';
import { AppHeader } from '@App/entrypoint/AppHeader';
import { AppMain } from '@App/entrypoint/AppMain';
import { AppNavbar } from '@App/entrypoint/AppNavbar';
import { PortalContextProvider } from '@App/storage/portalContext';
import donatePay from '@components/Integration/DonatePay';
import { COLORS } from '@constants/color.constants';
import AutoloadAutosave from '@domains/auction/archive/ui/AutoloadAutosave';
import { TutorialManager } from '@domains/tutorials';
import { RootState } from '@reducers';
import { setDonatePaySubscribeState } from '@reducers/Subscription/Subscription.ts';
import { useIsMobile } from '@shared/lib/ui';

import { getIntegrationsValidity } from '../../api/userApi';
import { useActiveMenu, useMenuItems } from '../../constants/menuItems.constants';
import { connectToBroadcastingSocket } from '../../domains/broadcasting/lib/socket';
import { useLotsBroadcasting } from '../../domains/broadcasting/lib/useLotsBroadcasting';
import { loadUserData, setAucSettings } from '../../reducers/AucSettings/AucSettings';
import { connectToSocketIo } from '../../reducers/socketIo/socketIo';
import { getCookie } from '../../utils/common.utils';
import { isBrowser } from '../../utils/ssr.ts';

import type { ThunkDispatch } from 'redux-thunk';

const hasToken = isBrowser && !!getCookie('userSession');

let openDriverTimeout: any;

const productionUrl = 'https://pointauc.com/';

const App: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [isHovered, setIsDrawerOpen] = useState(false);
  const [isTestEnvironmentModalOpened, setIsTestEnvironmentModalOpened] = useState(
    () => isBrowser && window.location.hostname === 'test.pointauc.com',
  );
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

  // const userQuery = useQuery({
  //   ...userControllerGetUserOptions({}),
  // });

  useEffect(() => {
    const loadUser = async () => {
      await loadUserData(dispatch);
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
    <PortalContextProvider>
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
      <TutorialManager />
      <AutoloadAutosave />
      <Modal
        opened={isTestEnvironmentModalOpened}
        onClose={() => setIsTestEnvironmentModalOpened(false)}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        title={t('testEnvironmentModal.title')}
      >
        <Alert icon={<IconAlertTriangle size={20} />} color='yellow' variant='light' mb='md'>
          <Text size='sm'>{t('testEnvironmentModal.description')}</Text>
          <Group gap='xxs' align='center' mt='xs'>
            <Text size='sm' fw={600}>
              {t('testEnvironmentModal.productionUrl')}
            </Text>
            <Anchor href={productionUrl} target='_blank' rel='noreferrer' size='sm' fw={600}>
              {productionUrl}
            </Anchor>
          </Group>
        </Alert>
        <Button fullWidth onClick={() => setIsTestEnvironmentModalOpened(false)}>
          {t('testEnvironmentModal.confirm')}
        </Button>
      </Modal>
    </PortalContextProvider>
  );
};

export default App;
