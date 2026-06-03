import { mergeAuthData } from '@reducers/User/User.ts';
import { authenticateTourniquet } from '@api/tourniquetApi.ts';
import { QUERIES } from '@constants/common.constants.ts';
import { BackendFlow } from '@domains/bids/external-integrations/shared/pubsub/Backend/backendFlow.ts';
import { store } from '@store';
import * as Integration from '@models/integration';

import './index.css';
import { buildAuthUrl } from './buildAuthUrl';
import TourniquetIcon from './TourniquetIcon';
import TourniquetLoginButton from './TourniquetLoginButton';

const id = 'tourniquet';

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  revoke: () => {
    store.dispatch(mergeAuthData({ [id]: undefined }));
  },
  loginComponent: TourniquetLoginButton,
  validate: () => true,
  url: buildAuthUrl,
  authenticate: authenticateTourniquet,
  redirectCodeQueryKey: QUERIES.REQUEST_ID,
};

const tourniquet: Integration.Config = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: new BackendFlow({ id }),
  branding: {
    icon: TourniquetIcon,
  },
};

export default tourniquet;
