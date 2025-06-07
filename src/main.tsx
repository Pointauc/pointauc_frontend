import '@mantine/core/styles.css';
import '@styles/index.scss';

import { configureStore } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnyAction, Middleware } from 'redux';
import thunk from 'redux-thunk';
import { CSSVariablesResolver, MantineProvider } from '@mantine/core';
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

const shadowOpacityMain = 0.12;
const shadowOpacitySecondary = 0.09;
const shadowOpacityXs = 0.2;

const cssResolver: CSSVariablesResolver = (theme) => ({
  variables: {},
  dark: {
    '--mantine-color-text': '#f3f3f3',

    '--mantine-shadow-xs': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), 0 calc(0.0625rem * var(--mantine-scale)) calc(0.125rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityXs})`,
    '--mantine-shadow-sm': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.9375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.4375rem * var(--mantine-scale)) calc(0.4375rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-md': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.25rem * var(--mantine-scale)) calc(1.5625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.625rem * var(--mantine-scale)) calc(0.625rem * var(--mantine-scale)) calc(-0.3125rem * var(--mantine-scale))`,
    '--mantine-shadow-lg': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(1.75rem * var(--mantine-scale)) calc(1.4375rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(0.75rem * var(--mantine-scale)) calc(0.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
    '--mantine-shadow-xl': `0 calc(0.0625rem * var(--mantine-scale)) calc(0.1875rem * var(--mantine-scale)) rgba(0, 0, 0, ${shadowOpacityMain}), rgba(0, 0, 0, ${shadowOpacityMain}) 0 calc(2.25rem * var(--mantine-scale)) calc(1.75rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale)), rgba(0, 0, 0, ${shadowOpacitySecondary}) 0 calc(1.0625rem * var(--mantine-scale)) calc(1.0625rem * var(--mantine-scale)) calc(-0.4375rem * var(--mantine-scale))`,
  },
  light: {},
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Provider store={store}>
    <ThemeWrapper>
      <MantineProvider defaultColorScheme='dark' cssVariablesResolver={cssResolver}>
        <RouterProvider router={router} />
      </MantineProvider>
    </ThemeWrapper>
  </Provider>,
);
