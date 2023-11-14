import { configureStore } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material';

import ROUTES from '@constants/routes.constants.ts';
import DARedirect from '@pages/redirects/DARedirect/DARedirect.tsx';
import TwitchRedirect from '@pages/redirects/TwitchRedirect/TwitchRedirect.tsx';
import rootReducer, { RootState } from '@reducers/index.ts';
import { setSlots } from '@reducers/Slots/Slots.ts';
import SaveLoadService from '@services/SaveLoadService.ts';
import { sortSlots } from '@utils/common.utils.ts';
import ChatWheelPage from '@components/ChatWheelPage/ChatWheelPage.tsx';
import { AUTOSAVE_NAME } from '@constants/slots.constants.ts';

import App from './App.tsx';
import ThemeWrapper from './ThemeWrapper.tsx';
import '@styles/index.scss';
import '@assets/i18n/index.ts';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

dayjs.locale('ru');

const SORTABLE_SLOT_EVENTS = [
  'slots/setSlotAmount',
  'slots/addExtra',
  'slots/deleteSlot',
  'slots/addSlot',
  'slots/addSlotAmount',
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

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, sortSlotsMiddleware],
});

window.onbeforeunload = (): undefined => {
  const { slots } = store.getState().slots;

  if (slots.length > 1) {
    SaveLoadService.rewrite(slots, AUTOSAVE_NAME);
  }

  return undefined;
};

const router = createBrowserRouter([
  { path: ROUTES.TWITCH_REDIRECT, element: <TwitchRedirect /> },
  { path: ROUTES.DA_REDIRECT, element: <DARedirect /> },
  { path: ROUTES.CHAT_WHEEL, element: <ChatWheelPage /> },
  { path: `${ROUTES.HOME}*`, element: <App /> },
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
