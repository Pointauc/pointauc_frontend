import TokenLoginButton from '@components/Integration/AuthFlow/Token/TokenLoginButton/TokenLoginButton.tsx';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { mergeAuthData } from '@reducers/User/User.ts';

import { store } from '../../../../main.tsx';

interface Params {
  authenticate: Integration.TokenFlow['authenticate'];
  id: Integration.ID;
}

const validate = (id: Integration.ID) => {
  return integrationUtils.storage.get(id, 'authToken') != null;
};

export const buildTokenAuthFlow = ({ id, authenticate }: Params): Integration.TokenFlow => ({
  authenticate,
  type: 'token',
  validate: () => validate(id),
  loginComponent: TokenLoginButton,
  getAccessToken: () => integrationUtils.storage.get(id, 'authToken') ?? '',
  revoke: () => {
    integrationUtils.storage.remove(id, 'authToken');
    store.dispatch(mergeAuthData({ [id]: undefined }));
  },
});
