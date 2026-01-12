import TwitchSvg from '@assets/icons/twitch.svg?react';
import { buildRedirectAuthFlow } from '@domains/bids/external-integrations/shared/auth/redirect/buildRedirectFlow.ts';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow.ts';
import { authenticateTwitch } from '@api/twitchApi.ts';
import * as Integration from '@models/integration';

import './index.css';

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
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const twitch: Integration.Config<Integration.RedirectFlow, BackendFlow> = {
  id,
  type: 'points',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: ({ size = 32 }) => <TwitchSvg width={size} height={size} />,
  },
};

export default twitch;
