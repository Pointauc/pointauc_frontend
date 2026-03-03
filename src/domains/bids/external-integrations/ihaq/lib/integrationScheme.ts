import { buildRedirectAuthFlow } from '@domains/bids/external-integrations/shared/auth/redirect/buildRedirectFlow';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow';
import ROUTES from '@constants/routes.constants';
import { ihaqControllerAuthorize } from '@api/openapi';
import { IhaqIcon } from '@domains/bids/external-integrations/ihaq/ui/Icon';
import * as Integration from '@models/integration';

import './ihaqStyles.css';

const id = 'ihaq';

const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/${id}${ROUTES.REDIRECT.DEFAULT}` : '';
const authParams = {
  client_id: '97045f2d-e0c1-416a-9b8f-d9de09d67775',
  redirect_uri: redirectUri,
  response_type: 'code',
};

const authUrl = 'https://ihaqdonate.com/oauth/authorize';

const authenticate = async (code: string) => {
  return ihaqControllerAuthorize({
    body: { code, redirect_uri: redirectUri },
  });
};

const authFlow = buildRedirectAuthFlow({ url: { path: authUrl, params: authParams }, authenticate, id });

const ihaq: Integration.Config = {
  id: 'ihaq',
  type: 'donate',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: IhaqIcon,
    description: 'Комиссия – 3,5%. Уникальные виджеты!',
    partner: true,
  },
};

export default ihaq;
