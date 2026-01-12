import { mergeAuthData } from '@reducers/User/User.ts';
import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton.tsx';
import { store } from '@reducers/store.ts';
import * as Integration from '@models/integration';

interface Params {
  id: Integration.ID;
  url: {
    path: string;
    params: Record<string, string>;
  };
  authenticate: Integration.RedirectFlow['authenticate'];
  redirectCodeQueryKey?: string;
}

export const buildRedirectAuthFlow = ({
  url,
  authenticate,
  id,
  redirectCodeQueryKey,
}: Params): Integration.RedirectFlow => {
  const authUrl = new URL(url.path);
  authUrl.search = new URLSearchParams(url.params).toString();

  return {
    type: 'redirect',
    redirectCodeQueryKey,
    authenticate,
    url: () => authUrl.toString(),
    validate: () => true,
    loginComponent: RedirectLoginButton,
    revoke: () => {
      store.dispatch(mergeAuthData({ [id]: undefined }));
    },
  };
};
