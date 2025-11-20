import { buildRedirectAuthFlow } from '@components/Integration/AuthFlow/Redirect/redirect';
import { BackendFlow } from '@components/Integration/PubsubFlow/Backend/backendFlow';
import ROUTES from '@constants/routes.constants';
import { ihaqControllerAuthorize } from '@api/openapi';
import { IhaqIcon } from '@domains/external-integration/ihaq/ui/Icon';

import './ihaqStyles.scss';

const id = 'ihaq';

const redirectUri = `${window.location.origin}/${id}${ROUTES.REDIRECT.DEFAULT}`;
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
  },
};

export default ihaq;
