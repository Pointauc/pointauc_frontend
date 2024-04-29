import TwitchSvg from '@assets/icons/twitch.svg?react';
import { buildRedirectAuthFlow } from '@components/Integration/AuthFlow/Redirect/redirect.ts';
import { authenticateDA } from '@api/daApi.ts';
import { setHasDAAuth, setHasTwitchAuth } from '@reducers/User/User.ts';
import { buildBackendFlow } from '@components/Integration/PubsubFlow/Backend/backendFlow.ts';
import { sendCpSubscribedState, sendDaSubscribedState } from '@reducers/Subscription/Subscription.ts';
import { authenticateTwitch } from '@api/twitchApi.ts';

import { store } from '../../../main.tsx';

import './index.scss';

const id = 'twitch';
const authParams = {
  client_id: '83xjs5k4yvqo0yn2cxu1v5lan2eeam',
  redirect_uri: `${window.location.origin}/twitch/redirect`,
  response_type: 'code',
  scope: 'channel:read:redemptions channel:manage:redemptions',
  force_verify: 'true',
};

const authUrl = 'https://id.twitch.tv/oauth2/authorize';

const authenticate = async (code: string) => {
  await authenticateTwitch(code);
  store.dispatch(setHasTwitchAuth(true));
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate });

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
