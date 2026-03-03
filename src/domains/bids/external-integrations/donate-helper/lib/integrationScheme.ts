import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers';
import { donateHelperControllerRevoke } from '@api/openapi/sdk.gen.ts';
import { mergeAuthData } from '@reducers/User/User.ts';
import * as Integration from '@models/integration';
import { store } from '@store';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow';
import { DonateHelperIcon } from '@domains/bids/external-integrations/donate-helper/ui/Icon';
import DonateHelperLoginButton from '@domains/bids/external-integrations/donate-helper/ui/LoginButton';

const id = 'donateHelper';

const validate = (): boolean => {
  return integrationUtils.storage.get(id, 'authToken') != null;
};

const getAccessToken = (): string => {
  return integrationUtils.storage.get(id, 'authToken') ?? '';
};

const revoke = async (): Promise<void> => {
  await donateHelperControllerRevoke();
  integrationUtils.storage.remove(id, 'authToken');
  store.dispatch(mergeAuthData({ [id]: undefined }));
};

const authFlow: Integration.TokenFlow = {
  type: 'token',
  authenticate: async () => {
    // Authentication is handled by the AuthModal
    return {};
  },
  validate,
  loginComponent: DonateHelperLoginButton,
  getAccessToken,
  revoke,
};

const donateHelper: Integration.Config = {
  id: 'donateHelper',
  type: 'donate',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: DonateHelperIcon,
  },
};

export default donateHelper;
