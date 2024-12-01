const key = 'aukus-token';

export const aukus = {
  getToken: () => localStorage.getItem(key),
  setToken: (token: string) => localStorage.setItem(key, token),
  isValid: () => !!localStorage.getItem(key),
  revoke: () => localStorage.removeItem(key),
  enabled: {
    set: (value: boolean) => localStorage.setItem('aukus-enabled', value.toString()),
    get: () => localStorage.getItem('aukus-enabled') === 'true' || localStorage.getItem('aukus-enabled') === null,
  },
};
