import clsx from 'clsx';

import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton';
import { buildRedirectAuthFlow } from '@domains/bids/external-integrations/shared/auth/redirect/buildRedirectFlow';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers';
import { VkVideoLivePubsubFlow } from '@domains/bids/external-integrations/VkVideoLive/lib/pubsubFlow';
import { VkVideoLiveIcon } from '@domains/bids/external-integrations/VkVideoLive/ui/Icon';
import { vkVideoLiveAuthApi } from '@api/vkVideoLiveApi';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User';
import { store } from '@store';
import { isBrowser } from '@utils/ssr';

import styles from './index.module.css';

const id: Integration.ID = 'vkVideoLive';
const redirectUri = isBrowser ? `${window.location.origin}/${id}/redirect` : '';
const authUrl = 'https://auth.live.vkvideo.ru/app/oauth2/authorize';
const scopes = ['channel:points', 'channel:points:rewards', 'channel:points:rewards:demands'];

const authParams = {
  client_id: import.meta.env.VITE_VK_VIDEO_LIVE_CLIENT_ID ?? '',
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: scopes.join(','),
};

const authenticate = async (code: string) => {
  const response = await vkVideoLiveAuthApi.authenticate(code, redirectUri);

  store.dispatch(
    mergeAuthData({
      vkVideoLive: response.auth,
    }),
  );
};

const redirectFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const authFlow: Integration.RedirectFlow = {
  ...redirectFlow,
  validate: () => Boolean(store.getState().user.authData.vkVideoLive?.isValid && vkVideoLiveAuthApi.getAccessToken()),
  loginComponent: ({ ...props }) => (
    <RedirectLoginButton
      {...props}
      classes={{ ...props.classes, icon: clsx(props.classes?.icon, styles.buttonIcon) }}
      buildUrl={redirectFlow.url}
    />
  ),
  revoke: async () => {
    await vkVideoLiveAuthApi.revoke();
    integrationUtils.session.remove(id, 'pubsubToken2');
    store.dispatch(mergeAuthData({ vkVideoLive: undefined }));
  },
};

const vkVideoLive: Integration.Config<Integration.RedirectFlow, VkVideoLivePubsubFlow> = {
  id,
  type: 'points',
  authFlow,
  pubsubFlow: new VkVideoLivePubsubFlow(),
  branding: {
    icon: VkVideoLiveIcon,
  },
};

export default vkVideoLive;
