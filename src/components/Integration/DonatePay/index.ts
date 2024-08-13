import DonatePaySvg from '@assets/icons/donatePay.svg?react';
import donatePayApi from '@api/donatePayApi.ts';
import { buildTokenAuthFlow } from '@components/Integration/AuthFlow/Token/token.ts';
import { buildCentrifugeFlow } from '@components/Integration/PubsubFlow/Centrifuge/centrifugeFlow.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';

import './index.scss';

import TokenFlow = Integration.TokenFlow;

interface DonatePayBidMessage {
  data: {
    notification: {
      id: number;
      user_id: number;
      type: 'donation';
      view: null;
      vars: {
        name: string;
        comment: string;
        sum: number;
        currency: string;
      };
      created_at: string;
    };
  };
}

const parseMessage = ({ data: { notification } }: DonatePayBidMessage): Purchase => ({
  timestamp: notification.created_at,
  cost: notification.vars.sum,
  username: notification.vars.name,
  message: notification.vars.comment,
  id: String(notification.id),
  isDonation: true,
  color: '#000000',
  source: 'donatePay',
});

const id = 'donatePay';

const authFlow = buildTokenAuthFlow({
  authenticate: donatePayApi.authenticate,
  id,
});

const donatePay: Integration.Config<TokenFlow> = {
  id,
  type: 'donate',
  authFlow,
  pubsubFlow: buildCentrifugeFlow({
    version: '2',
    url: 'wss://centrifugo.donatepay.ru:43002/connection/websocket',
    parseMessage,
    getAccessToken: authFlow.getAccessToken,
    id,
    authFlow,
    getToken: () => donatePayApi.pubsubToken(authFlow.getAccessToken()),
  }),
  branding: {
    icon: DonatePaySvg,
  },
};

export default donatePay;
