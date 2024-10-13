const key = 'token';

export const aukus = {
  getToken: () => localStorage.getItem(key),
  setToken: (token: string) => localStorage.setItem(key, token),
  isValid: () => !!localStorage.getItem(key),
  revoke: () => localStorage.removeItem(key),
};
