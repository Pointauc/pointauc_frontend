import { AppShell } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';

import UserSettings from '@domains/user-settings/pages/UserSettings/UserSettings';
import LogoutPage from '@pages/logout/LogoutPage.tsx';
import OverlaysPage from '@domains/overlays/ui/List/Page/OverlaysPage';
import OverlayPage from '@domains/overlays/ui/Edit/Page/OverlayPage';
import UserSettingsTanstack from '@domains/user-settings/pages/UserSettings/UserSettingsTanstack';
import HelpPage from '@components/HelpPage/HelpPage';
import RequestsPage from '@components/RequestsPage/RequestsPage';
import Metadata from '@components/Metadata';
import ROUTES from '@constants/routes.constants';
import AucPage from '@pages/auction/AucPage';
import HistoryPage from '@pages/history/HistoryPage/HistoryPage';
import WheelPage from '@pages/wheel/WheelPage/WheelPage';

import classes from './App.module.css';

export const AppMain = () => {
  return (
    <AppShell.Main className={classes.main}>
      <Metadata />
      <div style={{ display: 'none' }} hidden>
        <AucPage />
      </div>
      {/* <AlertsContainer /> */}
      <Routes>
        <Route path={`${ROUTES.SETTINGS}/*`} element={<UserSettings />} />
        <Route path={ROUTES.WHEEL} element={<WheelPage />} />
        <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTES.HELP} element={<HelpPage />} />
        {/* <Route path={ROUTES.STATISTIC} element={<Statistic />} /> */}
        <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
        <Route path={ROUTES.OVERLAYS} element={<OverlaysPage />} />
        <Route path={ROUTES.OVERLAY_EDIT} element={<OverlayPage />} />
        <Route path={ROUTES.TEST} element={<UserSettingsTanstack />} />
        <Route path={ROUTES.LOGOUT} element={<LogoutPage />} />
      </Routes>
    </AppShell.Main>
  );
};
