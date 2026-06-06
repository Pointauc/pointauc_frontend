import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@styles/index.scss';
import './index.css';
import '@assets/i18n/index.ts';

import { Notifications } from '@mantine/notifications';
import { HotkeysProvider } from '@tanstack/react-hotkeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/be';
import 'dayjs/locale/uk';
import { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import { AppErrorBoundary } from '@App/error-tracking/AppErrorBoundary';
import { RouteErrorBoundary } from '@App/error-tracking/RouteErrorBoundary';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import GlobalBidRuntime from '@domains/bids/lib/GlobalBidRuntime';
import i18n from '@assets/i18n/index.ts';
import Metadata from '@components/Metadata';
import RedirectPage from '@domains/bids/external-integrations/shared/auth/redirect/RedirectPage.tsx';
import ROUTES from '@constants/routes.constants.ts';
import { TutorialProvider } from '@domains/tutorials';
import rootReducer from '@reducers/index.ts';
import { configuredAnalyticsProviders, initAnalytics } from '@shared/lib/analytics';
import { createConfiguredErrorTrackingProvider } from '@shared/lib/error-tracking/providers';
import { initErrorTracking } from '@shared/lib/error-tracking/service';
import MantineProvider from '@shared/mantine/MantineProvider.tsx';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { createArchiveData } from '@domains/auction/archive/lib/archiveData';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import * as Integration from '@models/integration';
import { queryClient } from '@shared/lib/react-query/client.ts';
import { registerTestingScenarios } from '@domains/testing/registerTestingScenarios.ts';

import App from './App/entrypoint/App.tsx';
import { setupBackendApiConfig } from './api/backendConfig.ts';
import { initStore, store } from './store.ts';
// All static imports are hoisted; by the time this line executes, rootReducer
// is fully initialized, so initStore() can safely create the Redux store.
setupBackendApiConfig();
initErrorTracking(createConfiguredErrorTrackingProvider());
initStore(rootReducer);
registerTestingScenarios(store, []);

const analyticsProviders = configuredAnalyticsProviders.getProviders();
initAnalytics({
  providers: analyticsProviders,
});

export { store };

const OverlayViewPage = lazy(() => import('@domains/overlays/ui/View/Page/OverlayViewPage'));
const VideoRequestsPage = lazy(() => import('@domains/video-requests/ui/Page/VideoRequestsPage'));

dayjs.extend(relativeTime);
dayjs.extend(duration);

const initialLanguage = i18n.language === 'ua' ? 'uk' : i18n.language;
dayjs.locale(initialLanguage);

i18n.on('languageChanged', (language) => {
  const dayjsLocale = language === 'ua' ? 'uk' : language;
  dayjs.locale(dayjsLocale);
});

window.onbeforeunload = (): undefined => {
  const {
    slots: { slots },
    purchases: { purchases },
    actionsLog: { entries: actionLog },
  } = store.getState();

  if (slots.length > 1 || purchases.length > 0 || actionLog.length > 0) {
    const data = createArchiveData({
      lots: slotsToArchivedLots(slots),
      purchases,
      actionLog,
      isAutosave: true,
    });
    archiveApi.upsertAutosave(data).catch((err) => console.error('Final autosave failed:', err));
  }

  return undefined;
};

const redirectRoutes = integrationUtils.filterBy
  .authFlow<Integration.RedirectFlow>(INTEGRATIONS, 'redirect')
  .map((integration) => ({
    path: `/${integration.id}/redirect`,
    element: <RedirectPage integration={integration} />,
  }));

const router = createBrowserRouter([
  {
    errorElement: <RouteErrorBoundary />,
    element: (
      <MantineProvider>
        <HotkeysProvider defaultOptions={{ hotkey: { ignoreInputs: true } }}>
          <TutorialProvider>
            <QueryClientProvider client={queryClient}>
              <Notifications limit={4} autoClose={3000} />
              <Metadata />
              <GlobalBidRuntime />
              <Outlet />
            </QueryClientProvider>
          </TutorialProvider>
        </HotkeysProvider>
      </MantineProvider>
    ),
    children: [
      { path: ROUTES.VIDEO_REQUESTS, element: <VideoRequestsPage /> },
      { path: '/overlays/view/:id', element: <OverlayViewPage /> },
      { path: `${ROUTES.HOME}*`, element: <App /> },
      ...redirectRoutes,
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container!);

const portalRoot = document.createElement('div');
portalRoot.id = 'portal-root';
document.body.appendChild(portalRoot);

root.render(
  <Provider store={store}>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </Provider>,
);
