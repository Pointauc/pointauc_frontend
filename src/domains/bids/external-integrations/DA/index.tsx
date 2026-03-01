import clsx from 'clsx';

import { buildCentrifugeFlow } from '@domains/bids/external-integrations/shared/pubsub/Centrifuge/centrifugeFlow.ts';
import DASvg from '@assets/icons/DAAlert.svg?react';
import { buildRedirectAuthFlow } from '@domains/bids/external-integrations/shared/auth/redirect/buildRedirectFlow.ts';
import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton';
import { authenticateDA } from '@api/daApi.ts';
import ROUTES from '@constants/routes.constants.ts';
import ENDPOINTS from '@constants/api.constants.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';

import { isBrowser } from '@utils/ssr.ts';
import { store } from '@store';
import * as Integration from '@models/integration';
import styles from '@domains/bids/external-integrations/DA/index.module.css';

const id = 'da';

const authParams = {
  client_id: '6727',
  redirect_uri: isBrowser ? `${window.location.origin}/${id}${ROUTES.REDIRECT.DEFAULT}` : '',
  response_type: 'code',
  scope: 'oauth-donation-subscribe oauth-user-show',
  // force_verify: 'true',
};

const authUrl = 'https://www.donationalerts.com/oauth/authorize';

const authenticate = async (code: string) => {
  await authenticateDA(code);
};

const authFlow: Integration.RedirectFlow = {
  ...buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id }),
  loginComponent: ({ ...props }) => <RedirectLoginButton {...props} classes={{ button: styles.button, icon: styles.buttonIcon }} />,
};

const parseMessage = ({ id, username, message, created_at, amount_in_user_currency }: any): Purchase | null => {
  if (!amount_in_user_currency) return null;

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
  subscribeEndpoint: isBrowser ? location.origin + ENDPOINTS.DA.SUBSCRIBE : '',
  getChannel: (id) => `$alerts:donation_${id}`,
});

const da: Integration.Config = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: pubsubFlow,
  branding: {
    icon: ({ size = 32, classes }) => <DASvg width={size} height={size} className={clsx(classes, styles.icon)} />,
  },
};

export default da;
