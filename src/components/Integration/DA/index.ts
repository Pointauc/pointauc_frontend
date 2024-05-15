import DASvg from '@assets/icons/DAAlert.svg?react';
import { buildRedirectAuthFlow } from '@components/Integration/AuthFlow/Redirect/redirect.ts';
import { authenticateDA } from '@api/daApi.ts';
import { buildBackendFlow } from '@components/Integration/PubsubFlow/Backend/backendFlow.ts';
import { sendDaSubscribedState } from '@reducers/Subscription/Subscription.ts';

import { store } from '../../../main.tsx';

import './index.scss';

const id = 'da';
const authParams = {
  client_id: import.meta.env.VITE_DA_CLIENT_ID,
  redirect_uri: `${window.location.origin}/da/redirect`,
  response_type: 'code',
  scope: 'oauth-donation-subscribe oauth-user-show',
  // force_verify: 'true',
};

const authUrl = 'https://www.donationalerts.com/oauth/authorize';

const authenticate = async (code: string) => {
  await authenticateDA(code);
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const da: Integration.Config = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: buildBackendFlow({
    sendSubscribeState: (active) => store.dispatch(sendDaSubscribedState(active) as any),
  }),
  branding: {
    icon: DASvg,
  },
};

export default da;
