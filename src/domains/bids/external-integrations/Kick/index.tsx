import clsx from 'clsx';

import IntegrationLoginButton from '@domains/bids/external-integrations/shared/ui/IntegrationLoginButton/index.tsx';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow.ts';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User.ts';
import { store } from '@store';
import { isBrowser } from '@utils/ssr';
import { authenticateKick, revokeKick } from '@api/kickApi';
import {
  clearKickAuthSession,
  createKickAuthorizeUrl,
  getKickRedirectState,
  KICK_CODE_VERIFIER_STORAGE_KEY,
  KICK_STATE_STORAGE_KEY,
} from '@domains/bids/external-integrations/Kick/lib/auth';
import { KickIcon } from '@domains/bids/external-integrations/Kick/ui/Icon';

import styles from './index.module.css';

const id: Integration.ID = 'kick';
const redirectUri = isBrowser ? `${window.location.origin}/kick/redirect` : '';
const clientId = import.meta.env.VITE_KICK_CLIENT_ID ?? '';

const authenticate = async (code: string) => {
  const state = getKickRedirectState();
  const expectedState = sessionStorage.getItem(KICK_STATE_STORAGE_KEY) ?? '';
  const codeVerifier = sessionStorage.getItem(KICK_CODE_VERIFIER_STORAGE_KEY) ?? '';

  if (!state || !expectedState || state !== expectedState || !codeVerifier) {
    clearKickAuthSession();
    throw new Error('Invalid Kick OAuth state');
  }

  try {
    await authenticateKick({
      code,
      codeVerifier,
      redirectUri,
      state,
    });
  } finally {
    clearKickAuthSession();
  }
};

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  authenticate,
  validate: () => Boolean(store.getState().user.authData.kick?.isValid),
  url: () => '',
  loginComponent: ({ id: integrationId, branding, classes, showPartnerChip }: Integration.LoginButtonProps) => (
    <IntegrationLoginButton
      id={integrationId}
      branding={branding}
      classes={{ ...classes, icon: clsx(classes?.icon, styles.buttonIcon) }}
      showPartnerChip={showPartnerChip}
      color='#04ad1e'
      onClick={async () => {
        const authUrl = await createKickAuthorizeUrl(clientId, redirectUri);
        window.open(authUrl, '_self');
      }}
    />
  ),
  revoke: async () => {
    await revokeKick();
    store.dispatch(mergeAuthData({ kick: undefined }));
  },
};

const kick: Integration.Config<Integration.RedirectFlow, BackendFlow> = {
  id,
  type: 'points',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: KickIcon,
  },
};

export default kick;
