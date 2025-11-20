import { v4 as uuidv4 } from 'uuid';

import { mergeAuthData } from '@reducers/User/User.ts';
import RedirectLoginButton from '@components/Integration/AuthFlow/Redirect/LoginButton/LoginButton.tsx';
import { authenticateTourniquet } from '@api/tourniquetApi.ts';
import { QUERIES } from '@constants/common.constants.ts';
import { buildHeadlessFlow } from '@components/Integration/PubsubFlow/Headless/headlessFlow.ts';
import { sendTourniquetSubscribedState } from '@reducers/Subscription/Subscription.ts';

import { store } from '../../../main.tsx';

const id = 'tourniquet';

import '@components/Integration/Tourniquet/index.scss';

const authFlow: Integration.RedirectFlow = {
  type: 'redirect',
  revoke: () => {
    store.dispatch(mergeAuthData({ [id]: undefined }));
  },
  loginComponent: RedirectLoginButton,
  validate: () => true,
  url: () => {
    const authId = uuidv4();
    sessionStorage.setItem('tourniquet.authId', authId);

    return `https://tourniquet.app/oauth/fb243201e7151791610ee2f3c283776cd784675d571de68f2148b44a9bfcc646?requestId=${authId}`;
    // return `http://localhost:3000/tourniquet/redirect?requestId=10`;
  },
  authenticate: authenticateTourniquet,
  redirectCodeQueryKey: QUERIES.REQUEST_ID,
};

const Icon = () => {
  return (
    <svg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect width='28' height='28' rx='8' fill='#FFFF00'></rect>
      <line x1='17.6345' y1='20.6207' x2='12.6344' y2='9.6207' stroke='black' stroke-width='3'></line>
      <line x1='9.56326' y1='20.569' x2='12.5633' y2='10.569' stroke='black' stroke-width='3'></line>
      <line x1='13.431' y1='10.5633' x2='23.431' y2='13.5633' stroke='black' stroke-width='3'></line>
      <line x1='4.29412' y1='14.6765' x2='19.2941' y2='6.67647' stroke='black' stroke-width='3'></line>
    </svg>
  );
};

const tourniquet: Integration.Config = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: buildHeadlessFlow({
    sendSubscribeState: (active) => store.dispatch(sendTourniquetSubscribedState(active) as any),
  }),
  branding: {
    icon: Icon,
  },
};

export default tourniquet;
