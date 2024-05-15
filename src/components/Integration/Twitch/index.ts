import TwitchSvg from '@assets/icons/twitch.svg?react';
import { buildRedirectAuthFlow } from '@components/Integration/AuthFlow/Redirect/redirect.ts';
import { buildBackendFlow } from '@components/Integration/PubsubFlow/Backend/backendFlow.ts';
import { sendCpSubscribedState } from '@reducers/Subscription/Subscription.ts';
import { authenticateTwitch } from '@api/twitchApi.ts';

import { store } from '../../../main.tsx';

import './index.scss';

const id = 'twitch';
const authParams = {
  client_id: import.meta.env.VITE_TWITCH_CLIENT_ID,
  redirect_uri: `${window.location.origin}/twitch/redirect`,
  response_type: 'code',
  scope: 'channel:read:redemptions channel:manage:redemptions',
  force_verify: 'true',
};

const authUrl = 'https://id.twitch.tv/oauth2/authorize';

const authenticate = async (code: string) => {
  await authenticateTwitch(code);
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const twitch: Integration.Config = {
  id,
  type: 'points',
  authFlow,
  pubsubFlow: buildBackendFlow({
    sendSubscribeState: (active) => store.dispatch(sendCpSubscribedState(active) as any),
  }),
  branding: {
    icon: TwitchSvg,
  },
};

export default twitch;
