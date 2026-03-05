import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import '@styles/index.scss';
import './index.css';
import '@assets/i18n/index.ts';

import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import 'dayjs/locale/ru';
import 'dayjs/locale/be';
import 'dayjs/locale/uk';
import { lazy, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import INTEGRATIONS from '@domains/bids/external-integrations/integrations.ts';
import i18n from '@assets/i18n/index.ts';
import RedirectPage from '@domains/bids/external-integrations/shared/auth/redirect/RedirectPage.tsx';
import ROUTES from '@constants/routes.constants.ts';
import { TutorialProvider } from '@domains/tutorials';
import rootReducer from '@reducers/index.ts';
import MantineProvider from '@shared/mantine/MantineProvider.tsx';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import * as Integration from '@models/integration';
import { queryClient } from '@shared/lib/react-query/client.ts';

import App from './App/entrypoint/App.tsx';
import { initStore, store } from './store.ts';
// All static imports are hoisted; by the time this line executes, rootReducer
// is fully initialized, so initStore() can safely create the Redux store.
initStore(rootReducer);

export { store };

const OverlayViewPage = lazy(() => import('@domains/overlays/ui/View/Page/OverlayViewPage'));

dayjs.extend(relativeTime);
dayjs.extend(duration);

const initialLanguage = i18n.language === 'ua' ? 'uk' : i18n.language;
dayjs.locale(initialLanguage);

i18n.on('languageChanged', (language) => {
  const dayjsLocale = language === 'ua' ? 'uk' : language;
  dayjs.locale(dayjsLocale);
});

window.onbeforeunload = (): undefined => {
  const { slots } = store.getState().slots;

  if (slots.length > 1) {
    const lots = slotsToArchivedLots(slots);
    archiveApi.upsertAutosave({ lots }).catch((err) => console.error('Final autosave failed:', err));
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
    element: (
      <MantineProvider>
        <TutorialProvider>
          <QueryClientProvider client={queryClient}>
            <Notifications limit={4} autoClose={3000} />
            <Outlet />
          </QueryClientProvider>
        </TutorialProvider>
      </MantineProvider>
    ),
    children: [
      { path: `${ROUTES.HOME}*`, element: <App /> },
      { path: '/overlays/view/:id', element: <OverlayViewPage /> },
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
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
