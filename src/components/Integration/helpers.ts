import { UserState } from '@reducers/User/User.ts';

type StorageKey = 'authToken' | 'pubsubToken';

export const getStorageKey = (id: Integration.Config['id'], key: StorageKey): string => `${id}_${key}`;

const getStorageValue = (id: Integration.Config['id'], key: StorageKey): string | null => {
  return localStorage.getItem(getStorageKey(id, key));
};

const setStorageValue = (id: Integration.Config['id'], key: StorageKey, value: string): void => {
  localStorage.setItem(getStorageKey(id, key), value);
};

const isAvailable = (integration: Integration.Config, user: UserState): boolean => {
  switch (integration.id) {
    case 'donatePay':
      return user.hasDonatPayAuth;
  }
};

interface AvailabilityMap {
  available: Integration.Config[];
  unavailable: Integration.Config[];
}

export const integrationUtils = {
  storage: {
    get: getStorageValue,
    set: setStorageValue,
  },
  session: {
    get: (id: Integration.Config['id'], key: StorageKey): string | null =>
      sessionStorage.getItem(getStorageKey(id, key)),
    set: (id: Integration.Config['id'], key: StorageKey, value: string): void =>
      sessionStorage.setItem(getStorageKey(id, key), value),
  },
  filterBy: {
    available: (integrations: Integration.Config[], user: UserState) =>
      integrations.filter((item) => isAvailable(item, user)),
    unavailable: (integrations: Integration.Config[], user: UserState) =>
      integrations.filter((item) => !isAvailable(item, user)),
  },
  groupBy: {
    availability: (integrations: Integration.Config[], user: UserState) =>
      integrations.reduce<AvailabilityMap>(
        (acc, item) => {
          if (isAvailable(item, user)) {
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
};
