import RedirectLoginButton from '@components/Integration/AuthFlow/Redirect/LoginButton/LoginButton.tsx';
import { mergeAuthData } from '@reducers/User/User.ts';

import { store } from '../../../../main.tsx';

interface Params {
  id: Integration.ID;
  url: {
    path: string;
    params: Record<string, string>;
  };
  authenticate: Integration.RedirectFlow['authenticate'];
}

export const buildRedirectAuthFlow = ({ url, authenticate, id }: Params): Integration.RedirectFlow => {
  const authUrl = new URL(url.path);
  authUrl.search = new URLSearchParams(url.params).toString();

  return {
    type: 'redirect',
    authenticate,
    url: authUrl.toString(),
    validate: () => true,
    loginComponent: RedirectLoginButton,
    revoke: () => {
      store.dispatch(mergeAuthData({ [id]: undefined }));
    },
  };
};
