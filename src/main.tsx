import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@styles/index.scss';

import './index.css';
import '@assets/i18n/index.ts';
import { Notifications } from '@mantine/notifications';
import { configureStore } from '@reduxjs/toolkit';
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
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { throttle } from '@tanstack/react-pacer';

import i18n from '@assets/i18n/index.ts';
import RedirectPage from '@components/Integration/AuthFlow/Redirect/Page/RedirectPage.tsx';
import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import ROUTES from '@constants/routes.constants.ts';
import { TutorialProvider } from '@domains/tutorials';
import rootReducer, { RootState } from '@reducers/index.ts';
import { setSlots, slotsSlice } from '@reducers/Slots/Slots.ts';
import MantineProvider from '@shared/mantine/MantineProvider.tsx';
import { sortSlots } from '@utils/common.utils.ts';
import { timedFunction } from '@utils/dataType/function.utils.ts';
import { Slot } from '@models/slot.model.ts';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { slotsToArchivedLots } from '@domains/auction/archive/lib/converters';
import { recalculateAllLockedSlots } from '@utils/lockedPercentage.utils.ts';

import App from './App/entrypoint/App.tsx';

const OverlayViewPage = lazy(() => import('@domains/overlays/ui/View/Page/OverlayViewPage'));

dayjs.extend(relativeTime);
dayjs.extend(duration);

// Set initial dayjs locale based on i18n language
const initialLanguage = i18n.language === 'ua' ? 'uk' : i18n.language;
dayjs.locale(initialLanguage);

// Update dayjs locale when i18n language changes
i18n.on('languageChanged', (language) => {
  // Map i18n locale to dayjs locale (ua -> uk for Ukrainian)
  const dayjsLocale = language === 'ua' ? 'uk' : language;
  dayjs.locale(dayjsLocale);
});

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotData',
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
  'slots/mergeLot',
  'slots/setLockedPercentage',
];

const sortSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
      const { slots } = store.getState().slots;
      const updatedSlots = recalculateAllLockedSlots(slots);
      const sortedSlots = sortSlots(updatedSlots);

      return next(setSlots(sortedSlots));
    }
    return result;
  };

const SLOTS_UPDATE_EVENTS = Object.keys(slotsSlice.actions).map((actionName) => `${slotsSlice.name}/${actionName}`);

const saveSlotsWithCooldown = throttle(
  (slots: Slot[]) => {
    const lots = slotsToArchivedLots(slots);
    archiveApi
      .upsertAutosave({ lots })
      .then(() => console.log('Autosave updated', lots))
      .catch((err) => console.error('Autosave failed:', err));
  },
  { wait: 2000, trailing: true, leading: false },
);

const saveSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SLOTS_UPDATE_EVENTS.includes(action.type)) {
      const { slots } = store.getState().slots;

      saveSlotsWithCooldown(slots);
    }
    return result;
  };

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware, saveSlotsMiddleware],
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
  { path: `${ROUTES.HOME}*`, element: <App /> },
  { path: '/overlays/view/:id', element: <OverlayViewPage /> },
  ...redirectRoutes,
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);

const portalRoot = document.createElement('div');
portalRoot.id = 'portal-root';
document.body.appendChild(portalRoot);

root.render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider>
        <TutorialProvider>
          <QueryClientProvider client={queryClient}>
            <Notifications limit={4} autoClose={3000} />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </TutorialProvider>
      </MantineProvider>
    </Provider>
  </StrictMode>,
);
