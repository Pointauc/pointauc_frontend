import clsx from 'clsx';

import TwitchSvg from '@assets/icons/twitch.svg?react';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow.ts';
import { openTwitchRewardErrorModal } from '@domains/bids/external-integrations/Twitch/rewardErrorModal.tsx';
import { authenticateTwitch } from '@api/twitchApi.ts';
import * as Integration from '@models/integration';
import { isBrowser } from '@utils/ssr.ts';
import styles from '@domains/bids/external-integrations/Twitch/index.module.css';
import RedirectLoginButton from '@domains/bids/external-integrations/shared/auth/redirect/LoginButton';
import { buildRedirectAuthFlow } from '@domains/bids/external-integrations/shared/auth/redirect/buildRedirectFlow';

const id = 'twitch';
const authParams = {
  client_id: import.meta.env.VITE_TWITCH_CLIENT_ID ?? 'TWITCH CLIENT ID NOT FOUND',
  redirect_uri: isBrowser ? `${window.location.origin}/twitch/redirect` : '',
  response_type: 'code',
  scope: 'channel:read:redemptions channel:manage:redemptions',
  force_verify: 'true',
};

const authUrl = 'https://id.twitch.tv/oauth2/authorize';

const authenticate = async (code: string) => {
  await authenticateTwitch(code);
};

const authFlow: Integration.RedirectFlow = {
  ...buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id }),
  loginComponent: ({ ...props }) => (
    <RedirectLoginButton
      {...props}
      buildUrl={() => authUrl}
      classes={{ button: styles.button, icon: styles.buttonIcon }}
    />
  ),
};

const twitch: Integration.Config<Integration.RedirectFlow, BackendFlow> = {
  id,
  type: 'points',
  authFlow,
  pubsubFlow: new BackendFlow({ id, connectErrorHandler: openTwitchRewardErrorModal }),
  branding: {
    icon: ({ size = 32, classes }) => <TwitchSvg width={size} height={size} className={clsx(classes, styles.icon)} />,
  },
};

export default twitch;
