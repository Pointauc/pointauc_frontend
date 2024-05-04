import { UserState } from '@reducers/User/User.ts';
import { setSubscribeState } from '@reducers/Subscription/Subscription.ts';

import { store } from '../../main.tsx';

type StorageKey = 'authToken' | 'pubsubToken2';

export const getStorageKey = (id: Integration.Config['id'], key: StorageKey): string => `${id}_${key}`;

const getStorageValue = (id: Integration.Config['id'], key: StorageKey): string | null => {
  return localStorage.getItem(getStorageKey(id, key));
};

const setStorageValue = (id: Integration.Config['id'], key: StorageKey, value: string): void => {
  localStorage.setItem(getStorageKey(id, key), value);
};

const isAvailable = (integration: Integration.Config, authData: UserState['authData']): boolean => {
  return !!authData[integration.id]?.isValid && integration.authFlow.validate();
};

interface AvailabilityMap {
  available: Integration.Config[];
  unavailable: Integration.Config[];
}

export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token');
  }
}

export const integrationUtils = {
  storage: {
    get: getStorageValue,
    set: setStorageValue,
    remove: (id: Integration.Config['id'], key: StorageKey) => localStorage.removeItem(getStorageKey(id, key)),
  },
  session: {
    get: (id: Integration.Config['id'], key: StorageKey): string | null =>
      sessionStorage.getItem(getStorageKey(id, key)),
    set: (id: Integration.Config['id'], key: StorageKey, value: string): void =>
      sessionStorage.setItem(getStorageKey(id, key), value),
  },
  filterBy: {
    authFlow: <T extends Integration.AuthFlow>(
      integrations: Integration.Config[],
      type: Integration.AuthFlow['type'],
    ): Integration.Config<T>[] =>
      integrations.filter((integration) => integration.authFlow.type === type) as Integration.Config<T>[],
  },
  groupBy: {
    availability: (integrations: Integration.Config[], authData: UserState['authData']) =>
      integrations.reduce<AvailabilityMap>(
        (acc, item) => {
          if (isAvailable(item, authData)) {
            acc.available.push(item);
          } else {
            acc.unavailable.push(item);
          }
          return acc;
        },
        { available: [], unavailable: [] },
      ),
    type: (integrations: Integration.Config[]) =>
      integrations.reduce<Record<Integration.Config['type'], Integration.Config[]>>(
        (acc, item) => {
          acc[item.type].push(item);
          return acc;
        },
        { donate: [], points: [] },
      ),
  },
  setSubscribeState: async ({ id, pubsubFlow }: Integration.Config, state: boolean, ignoreLoading?: boolean) => {
    const { subscription, user } = store.getState();
    const previous = subscription[id];
    if (previous.actual === state || (!ignoreLoading && previous.loading)) return;

    try {
      store.dispatch(setSubscribeState({ state: { actual: state, loading: true }, id }));
      if (state) {
        const userId = user.authData[id]?.id;
        if (!userId) throw new Error('User not found');

        await pubsubFlow.connect(userId);
      } else {
        await pubsubFlow.disconnect();
      }

      store.dispatch(setSubscribeState({ state: { loading: false }, id }));
    } catch (e) {
      console.log(e);
      store.dispatch(setSubscribeState({ state: previous, id }));
    }
  },
};
