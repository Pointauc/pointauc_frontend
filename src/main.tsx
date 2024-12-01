import { configureStore } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { Theme } from '@mui/material';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

import ROUTES from '@constants/routes.constants.ts';
import rootReducer, { RootState } from '@reducers/index.ts';
import { setSlots } from '@reducers/Slots/Slots.ts';
import SaveLoadService from '@services/SaveLoadService.ts';
import { sortSlots } from '@utils/common.utils.ts';
import ChatWheelPage from '@components/ChatWheelPage/ChatWheelPage.tsx';
import { AUTOSAVE_NAME } from '@constants/slots.constants.ts';
import { timedFunction } from '@utils/dataType/function.utils.ts';
import { Slot } from '@models/slot.model.ts';
import i18n from '@assets/i18n/index.ts';
import '@assets/i18n/index.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import RedirectPage from '@components/Integration/AuthFlow/Redirect/Page/RedirectPage.tsx';
import AukusRedirectPage from '@components/Event/Aukus/AukusRedirectPage.tsx';

import App from './App.tsx';
import ThemeWrapper from './ThemeWrapper.tsx';

import '@styles/index.scss';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

i18n.on('languageChanged', (language) => dayjs.locale(language));
dayjs.extend(relativeTime);
dayjs.extend(duration);

const SORTABLE_SLOT_EVENTS = [
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

const saveSlotsWithCooldown = timedFunction((slots: Slot[]) => {
  SaveLoadService.rewrite(slots, AUTOSAVE_NAME);
}, 2000);

const saveSlotsMiddleware: Middleware<{}, RootState> =
  (store) =>
  (next) =>
  (action): AnyAction => {
    const result = next(action);
    if (action.type.startsWith('slots')) {
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
  ...redirectRoutes,
]);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Provider store={store}>
    <ThemeWrapper>
      <RouterProvider router={router} />
    </ThemeWrapper>
  </Provider>,
);
