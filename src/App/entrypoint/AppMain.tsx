import { AppShell } from '@mantine/core';
import { Route, Routes, useMatch } from 'react-router-dom';
import { lazy } from 'react';

import UserSettings from '@domains/user-settings/pages/UserSettings/UserSettings';
import LogoutPage from '@pages/logout/LogoutPage.tsx';
import UserSettingsTanstack from '@domains/user-settings/pages/UserSettings/UserSettingsTanstack';
import HelpPage from '@components/HelpPage/HelpPage';
import Metadata from '@components/Metadata';
import ROUTES from '@constants/routes.constants';
import AucPage from '@pages/auction/AucPage';
import WheelPage from '@pages/wheel/WheelPage/WheelPage';
import LoadingPage from '@components/LoadingPage/LoadingPage';

import classes from './App.module.css';

const OverlaysPage = lazy(() => import('@domains/overlays/ui/List/Page/OverlaysPage'));
const OverlayPage = lazy(() => import('@domains/overlays/ui/Edit/Page/OverlayPage'));
const HistoryPage = lazy(() => import('@pages/history/HistoryPage/HistoryPage'));

export const AppMain = () => {
  const isHomePage = useMatch(ROUTES.HOME);
  return (
    <AppShell.Main className={classes.main}>
      <Metadata />
      <div style={{ display: isHomePage ? 'contents' : 'none' }} hidden={!isHomePage}>
        <AucPage />
      </div>
      {/* <AlertsContainer /> */}
      <Routes>
        <Route path={`${ROUTES.SETTINGS}/*`} element={<UserSettings />} />
        <Route path={ROUTES.WHEEL} element={<WheelPage />} />
        <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTES.HELP} element={<HelpPage />} />
        {/* <Route path={ROUTES.STATISTIC} element={<Statistic />} /> */}
        <Route path={ROUTES.OVERLAYS} element={<OverlaysPage />} />
        <Route path={ROUTES.OVERLAY_EDIT} element={<OverlayPage />} />
        <Route path={ROUTES.TEST} element={<LoadingPage helpText={'lorem ipsum dolor sit amet'} />} />
        <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
      </Routes>
    </AppShell.Main>
  );
};
