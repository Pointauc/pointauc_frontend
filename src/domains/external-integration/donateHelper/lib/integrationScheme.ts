import { BackendFlow } from '@components/Integration/PubsubFlow/Backend/backendFlow';
import { donateHelperControllerRevoke } from '@api/openapi/sdk.gen.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { mergeAuthData } from '@reducers/User/User.ts';
import { DonateHelperIcon } from '@domains/external-integration/donateHelper/ui/Icon';
import DonateHelperLoginButton from '@domains/external-integration/donateHelper/ui/LoginButton';

import { store } from '../../../../main.tsx';

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
