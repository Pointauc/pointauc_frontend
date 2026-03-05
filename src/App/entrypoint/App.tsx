import { Alert, Anchor, AppShell, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

import classes from '@App/entrypoint/App.module.css';
import { AppHeader } from '@App/entrypoint/AppHeader';
import { AppMain } from '@App/entrypoint/AppMain';
import { AppNavbar } from '@App/entrypoint/AppNavbar';
import { PortalContextProvider } from '@App/storage/portalContext';
import { COLORS } from '@constants/color.constants';
import AutoloadAutosave from '@domains/auction/archive/ui/AutoloadAutosave';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import { globalBidsEventBus } from '@domains/bids/lib/globalBidsEventBus.ts';
import { TutorialManager } from '@domains/tutorials';
import { RootState } from '@reducers';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';
import { useIsMobile } from '@shared/lib/ui';
import { getSocketIOUrl } from '@utils/url.utils.ts';

import { getIntegrationsValidity } from '../../api/userApi';
import { useActiveMenu, useMenuItems } from '../../constants/menuItems.constants';
import ROUTES from '../../constants/routes.constants';
import { connectToBroadcastingSocket } from '../../domains/broadcasting/lib/socket';
import { useLotsBroadcasting } from '../../domains/broadcasting/lib/useLotsBroadcasting';
import { loadUserData, setAucSettings } from '../../reducers/AucSettings/AucSettings';
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
      dispatch(connectToBroadcastingSocket);

      // Connect to global socket
      const globalSocket = io(`${getSocketIOUrl()}`, { query: { cookie: document.cookie }, transports: ['websocket'] });

      globalSocket.on('Bid', (bid: Purchase) => {
        globalBidsEventBus.emit('bid', { ...bid, source: 'API' });
      });

      return () => {
        globalSocket.disconnect();
      };
    }
  }, [dispatch, username]);

  // Redirect all bids to the global event bus
  useEffect(() => {
    // Subscribe to all integration bid events and redirect to global bus
    const unsubscribers = integrations.all.map((integration) => {
      const callback = (bid: Purchase) => {
        globalBidsEventBus.emit('bid', bid);
      };
      integration.pubsubFlow.events.on('bid', callback);
      return () => {
        integration.pubsubFlow.events.off('bid', callback);
      };
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Handle new bids
  useEffect(() => {
    const handleBid = (bid: Purchase) => {
      dispatch(processRedemption(bid));
    };
    globalBidsEventBus.on('bid', handleBid);
    return () => {
      globalBidsEventBus.off('bid', handleBid);
    };
  }, [dispatch]);

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
        <Alert icon={<IconInfoCircle size={20} />} color='blue' variant='light' mb='md'>
          <Group gap='xxs' align='center'>
            <Text size='sm'>{t('testEnvironmentModal.stateExport')}</Text>
            <Anchor component={Link} to={ROUTES.SETTINGS} size='sm' fw={600}>
              {t('testEnvironmentModal.settingsLink')}
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
