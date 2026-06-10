import { Alert, Anchor, AppShell, Box, Button, Group, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';

import { AppHeader } from '@App/entrypoint/AppHeader';
import { AppMain } from '@App/entrypoint/AppMain';
import { AppNavbar } from '@App/entrypoint/navbar/AppNavbar.tsx';
import { PortalContextProvider } from '@App/storage/portalContext';
import AutoloadAutosave from '@domains/auction/archive/ui/AutoloadAutosave';
import { useInitializeUser } from '@domains/bids/lib/useInitializeUser.ts';
import { registerPublicApiSocketHandlers } from '@domains/public-api/lib/socket.ts';
import { TutorialManager } from '@domains/tutorials';
import GeometryBackgroundPreview from '@domains/user-settings-v2/Widgets/appearance/auction-background/background-types/geometry/GeometryBackgroundPreview.tsx';
import { MenuItem } from '@models/common.model';
import { RootState } from '@reducers';
import { buildSocketIoOptions } from '@shared/lib/socketIo';
import { useIsMobile } from '@shared/lib/ui';
import { getSocketIOUrl } from '@utils/url.utils.ts';
import { registerGlobalBidFallbackConsumer } from '@domains/bids/lib/globalBidsEventBus.ts';
import { processRedemption } from '@reducers/Purchases/Purchases.ts';

import ROUTES from '../../constants/routes.constants';
import { connectToBroadcastingSocket, disconnectBroadcastingSocket } from '../../domains/broadcasting/lib/socket';
import { useLotsBroadcasting } from '../../domains/broadcasting/lib/useLotsBroadcasting';
import { isBrowser } from '../../utils/ssr.ts';

import type { ThunkDispatch } from 'redux-thunk';

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
  const [activeMenu, setActiveMenu] = useState<MenuItem | undefined>();

  const [isNavbarOpened, mobileNavbar] = useDisclosure();
  const isMobile = useIsMobile();

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
      const globalSocket = io(
        `${getSocketIOUrl()}`,
        buildSocketIoOptions('default', { query: { cookie: document.cookie } }),
      );
      const unregisterPublicApiSocketHandlers = registerPublicApiSocketHandlers(globalSocket, dispatch);

      return () => {
        unregisterPublicApiSocketHandlers();
        dispatch(disconnectBroadcastingSocket);
        globalSocket.disconnect();
      };
    }
  }, [dispatch, username]);

  useInitializeUser();

  useEffect(() => {
    return registerGlobalBidFallbackConsumer(async (bid) => {
      dispatch(processRedemption(bid));
      return true;
    });
  }, [dispatch]);

  const isNavbarExpanded = useMemo(() => {
    return (isHovered && activeMenu?.navbarFixedState !== 'closed') || activeMenu?.navbarFixedState === 'opened';
  }, [isHovered, activeMenu]);
  const backgroundType = useSelector((root: RootState) => root.aucSettings.settings.backgroundType);
  const hasGeometryBackground = backgroundType === 'geometry';
  const isGeometryBackgroundColorEnabled = useSelector(
    (root: RootState) => root.aucSettings.settings.isGeometryBackgroundColorEnabled,
  );

  return (
    <PortalContextProvider>
      <AppShell
        padding={0}
        header={{ height: { base: 50, sm: 0 } }}
        navbar={{ width: 70, breakpoint: 'sm', collapsed: { mobile: !isNavbarOpened } }}
        transitionDuration={isMobile ? 200 : 0}
      >
        {!hasGeometryBackground && <div className='bg-paper-900 absolute top-0 left-0 z-[-1] h-full w-full' />}
        {hasGeometryBackground ? (
          <Box className='absolute top-0 left-0 z-[-1] h-full w-full'>
            <GeometryBackgroundPreview isColorEnabled={isGeometryBackgroundColorEnabled} />
          </Box>
        ) : null}
        <AppHeader isNavbarOpened={isNavbarOpened} toggleNavbar={mobileNavbar.toggle} activeMenu={activeMenu} t={t} />
        <AppNavbar
          onActiveMenuChange={setActiveMenu}
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
