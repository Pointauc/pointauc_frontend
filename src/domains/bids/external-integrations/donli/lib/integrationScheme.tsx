import { useTranslation } from 'react-i18next';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow';
import { donliControllerAuthorize, donliControllerRevoke } from '@api/openapi';
import { DonliIcon } from '@domains/bids/external-integrations/donli/ui/Icon';
import DonliLoginButton from '@domains/bids/external-integrations/donli/ui/LoginButton';
import {
  clearDonliAuthSession,
  DONLI_CODE_VERIFIER_STORAGE_KEY,
  DONLI_STATE_STORAGE_KEY,
  getDonliRedirectState,
} from '@domains/bids/external-integrations/donli/lib/auth';
import { resolvePublicOrigin } from '@shared/lib/desktop/resolvePublicOrigin';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User';
import { store } from '@store';
import { isBrowser } from '@utils/ssr';

const id: Integration.ID = 'donli';

const getRedirectUri = (): string => (isBrowser ? `${resolvePublicOrigin()}/${id}/redirect` : '');
const clientId = import.meta.env.VITE_DONLI_CLIENT_ID ?? '';

const authenticate = async (code: string) => {
  const rawState = getDonliRedirectState();
  const state = rawState.startsWith('desktop.') ? rawState.slice('desktop.'.length) : rawState;
  const expectedState = sessionStorage.getItem(DONLI_STATE_STORAGE_KEY) ?? '';
  const codeVerifier = sessionStorage.getItem(DONLI_CODE_VERIFIER_STORAGE_KEY) ?? '';

  if (!state || !expectedState || state !== expectedState || !codeVerifier) {
    clearDonliAuthSession();
    throw new Error('Invalid Donli OAuth state or verifier');
  }

  try {
    await donliControllerAuthorize({
      body: {
        code,
        code_verifier: codeVerifier,
        redirect_uri: getRedirectUri(),
      },
    });
  } finally {
    clearDonliAuthSession();
  }
};

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  authenticate,
  validate: () => Boolean(store.getState().user.authData.donli?.isValid),
  url: () => '',
  loginComponent: (props: Integration.LoginButtonProps) => (
    <DonliLoginButton
      {...props}
      clientId={clientId}
      redirectUri={getRedirectUri()}
    />
  ),
  revoke: async () => {
    await donliControllerRevoke();
    store.dispatch(mergeAuthData({ donli: undefined }));
  },
};

const Title = () => {
  const { t } = useTranslation();
  return <span>{t('integration.donli.name', 'ДОНЛИ')}</span>;
};

const donli: Integration.Config<Integration.RedirectFlow, BackendFlow> = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: DonliIcon,
    title: <Title />,
    description: (
      <span className='text-xs'>
        Донаты <strong>Donli</strong>
      </span>
    ),
  },
};

export default donli;
