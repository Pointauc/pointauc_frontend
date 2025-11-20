import DASvg from '@assets/icons/DAAlert.svg?react';
import { buildRedirectAuthFlow } from '@components/Integration/AuthFlow/Redirect/redirect.ts';
import { authenticateDA } from '@api/daApi.ts';
import ROUTES from '@constants/routes.constants.ts';
import { buildCentrifugeFlow } from '@components/Integration/PubsubFlow/Centrifuge/centrifugeFlow.ts';
import ENDPOINTS from '@constants/api.constants.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';

import { store } from '../../../main.tsx';
import './index.scss';

const id = 'da';

const authParams = {
  client_id: '6727',
  redirect_uri: `${window.location.origin}/${id}${ROUTES.REDIRECT.DEFAULT}`,
  response_type: 'code',
  scope: 'oauth-donation-subscribe oauth-user-show',
  // force_verify: 'true',
};

const authUrl = 'https://www.donationalerts.com/oauth/authorize';

const authenticate = async (code: string) => {
  await authenticateDA(code);
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const parseMessage = ({ id, username, message, created_at, amount_in_user_currency }: any): Purchase => {
  return {
    id: id.toString(),
    username,
    message,
    timestamp: created_at,
    cost: Math.round(amount_in_user_currency),
    color: '#000000',
    isDonation: true,
    source: 'da',
  };
};

const pubsubFlow = buildCentrifugeFlow({
  version: 'websocketV2',
  url: 'wss://centrifugo.donationalerts.com/connection/websocket',
  parseMessage,
  subscribeHeaders: () => ({
    Authorization: `Bearer ${store.getState().user.authData.da?.accessToken}`,
  }),
  id,
  authFlow,
  getToken: async () => store.getState().user.authData.da?.socketConnectionToken,
  subscribeEndpoint: location.origin + ENDPOINTS.DA.SUBSCRIBE,
  getChannel: (id) => `$alerts:donation_${id}`,
});

const da: Integration.Config = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: pubsubFlow,
  branding: {
    icon: DASvg,
  },
};

export default da;
