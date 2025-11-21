import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@styles/index.scss';

import { Notifications } from '@mantine/notifications';
import { Theme } from '@mui/material';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { StrictMode } from 'react';
import '@assets/i18n/index.ts';

import i18n from '@assets/i18n/index.ts';
import ChatWheelPage from '@components/ChatWheelPage/ChatWheelPage.tsx';
import AukusRedirectPage from '@components/Event/Aukus/AukusRedirectPage.tsx';
import RedirectPage from '@components/Integration/AuthFlow/Redirect/Page/RedirectPage.tsx';
import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import ROUTES from '@constants/routes.constants.ts';
import { AUTOSAVE_NAME } from '@constants/slots.constants.ts';
import { Slot } from '@models/slot.model.ts';
import rootReducer, { RootState } from '@reducers/index.ts';
import { setSlots, slotsSlice } from '@reducers/Slots/Slots.ts';
import SaveLoadService from '@services/SaveLoadService.ts';
import MantineProvider from '@shared/mantine/MantineProvider.tsx';
import { sortSlots } from '@utils/common.utils.ts';
import { timedFunction } from '@utils/dataType/function.utils.ts';
import { OverlayViewPage } from '@domains/overlays/index.ts';

import App from './App/entrypoint/App.tsx';
import ThemeWrapper from './ThemeWrapper.tsx';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

i18n.on('languageChanged', (language) => dayjs.locale(language));
dayjs.extend(relativeTime);
dayjs.extend(duration);

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotData',
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
  'slots/mergeLot',
];

const sortSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (SORTABLE_SLOT_EVENTS.includes(action.type)) {
      const sortedSlots = sortSlots(store.getState().slots.slots);

      return next(setSlots(sortedSlots));
    }
    return result;
  };

const SLOTS_UPDATE_EVENTS = Object.keys(slotsSlice.actions).map((actionName) => `${slotsSlice.name}/${actionName}`);

const saveSlotsWithCooldown = timedFunction((slots: Slot[]) => {
  console.log('saveSlotsWithCooldown', slots);
  SaveLoadService.rewrite(slots, AUTOSAVE_NAME);
}, 2000);

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
    SaveLoadService.rewrite(slots, AUTOSAVE_NAME);
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
  { path: ROUTES.CHAT_WHEEL, element: <ChatWheelPage /> },
  { path: `${ROUTES.HOME}*`, element: <App /> },
  { path: ROUTES.AUKUS.REDIRECT, element: <AukusRedirectPage /> },
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
root.render(
  <StrictMode>
    <Provider store={store}>
      <ThemeWrapper>
        <MantineProvider>
          <QueryClientProvider client={queryClient}>
            <Notifications />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </MantineProvider>
      </ThemeWrapper>
    </Provider>
  </StrictMode>,
);
