import { useTranslation } from 'react-i18next';

import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow';
import { memeAlertsControllerAuthorize, memeAlertsControllerRevoke } from '@api/openapi';
import { MemeAlertsIcon } from '@domains/bids/external-integrations/memealerts/ui/Icon';
import MemeAlertsLoginButton from '@domains/bids/external-integrations/memealerts/ui/LoginButton';
import {
  createMemeAlertsAuthorizeUrl,
  getMemeAlertsRedirectUri,
} from '@domains/bids/external-integrations/memealerts/lib/auth';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User';
import { store } from '@store';

const id: Integration.ID = 'memeAlerts';

const authenticate = async (code: string) => {
  await memeAlertsControllerAuthorize({
    body: {
      code,
      redirect_uri: getMemeAlertsRedirectUri(),
    },
  });
};

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  authenticate,
  validate: () => Boolean(store.getState().user.authData.memeAlerts?.isValid),
  url: () => createMemeAlertsAuthorizeUrl(),
  loginComponent: (props: Integration.LoginButtonProps) => <MemeAlertsLoginButton {...props} />,
  revoke: async () => {
    await memeAlertsControllerRevoke();
    store.dispatch(mergeAuthData({ memeAlerts: undefined }));
  },
};

// eslint-disable-next-line react-refresh/only-export-components
const Title = () => {
  const { t } = useTranslation();
  return <span>{t('integration.memeAlerts.name', 'MemeAlerts')}</span>;
};

const memeAlerts: Integration.Config<Integration.RedirectFlow, BackendFlow> = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: MemeAlertsIcon,
    title: <Title />,
    description: (
      <span className='text-xs'>
        Донаты <strong>MemeAlerts</strong>
      </span>
    ),
  },
};

export default memeAlerts;
