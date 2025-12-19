import { buildTokenAuthFlow } from '@components/Integration/AuthFlow/Token/token.ts';
import DonatePaySvg from '@assets/icons/donatePay.svg?react';
import donatePayApi from '@api/donatePayApi.ts';
import { buildCentrifugeFlow } from '@components/Integration/PubsubFlow/Centrifuge/centrifugeFlow.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import { mergeAuthData } from '@reducers/User/User.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { donatePayRuControllerRevoke, donatePayEuControllerRevoke } from '@api/openapi/sdk.gen.ts';

import { store } from '../../../main.tsx';

import DonatePayLoginButton from './DonatePayLoginButton.tsx';
import { DonatePayRegion, DONATE_PAY_REGIONS } from './types.ts';
import styles from './index.module.css';
import './index2.css';

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

/**
 * Determines the active DonatePay region based on authData.
 * Priority: EU > RU (if both are present, EU is used)
 */
export const getActiveRegion = (): DonatePayRegion | null => {
  const { authData } = store.getState().user;

  if (authData.donatePayEu?.isValid) {
    return 'eu';
  }
  if (authData.donatePay?.isValid) {
    return 'ru';
  }
  return null;
};

/**
 * Gets the active integration ID based on the current region.
 */
export const getActiveIntegrationId = (): Integration.ID => {
  const region = getActiveRegion();
  return region ? DONATE_PAY_REGIONS[region].integrationId : 'donatePay';
};

/**
 * Gets the access token for the active region.
 */
const getAccessToken = (): string => {
  const region = getActiveRegion();
  if (!region) return '';

  const integrationId = DONATE_PAY_REGIONS[region].integrationId;
  return integrationUtils.storage.get(integrationId, 'authToken') ?? '';
};

/**
 * Validates that we have an auth token for at least one region.
 */
const validate = (): boolean => {
  return (
    integrationUtils.storage.get('donatePay', 'authToken') != null ||
    integrationUtils.storage.get('donatePayEu', 'authToken') != null
  );
};

/**
 * Gets the pubsub token for the active region.
 */
const getPubsubToken = async (): Promise<string> => {
  const region = getActiveRegion();
  if (!region) throw new Error('No active DonatePay region');

  const accessToken = getAccessToken();
  return region === 'eu' ? donatePayApi.pubsubTokenEu(accessToken) : donatePayApi.pubsubTokenRu(accessToken);
};

/**
 * Gets the centrifuge URL for the active region.
 */
const getCentrifugeUrl = (): string => {
  const region = getActiveRegion();
  return region ? DONATE_PAY_REGIONS[region].centrifugeUrl : DONATE_PAY_REGIONS.ru.centrifugeUrl;
};

/**
 * Gets the subscribe endpoint for the active region.
 */
const getSubscribeEndpoint = (): string => {
  const region = getActiveRegion();
  return region ? DONATE_PAY_REGIONS[region].subscribeEndpoint : DONATE_PAY_REGIONS.ru.subscribeEndpoint;
};

/**
 * Revokes the active region's integration.
 */
const revoke = async (): Promise<void> => {
  integrationUtils.session.remove('donatePay', 'pubsubToken2');
  const region = getActiveRegion();
  if (!region) return;

  const integrationId = DONATE_PAY_REGIONS[region].integrationId;

  if (region === 'eu') {
    await donatePayEuControllerRevoke();
  } else {
    await donatePayRuControllerRevoke();
  }

  integrationUtils.storage.remove(integrationId, 'authToken');
  store.dispatch(mergeAuthData({ [integrationId]: undefined }));
};

const authFlow: Integration.TokenFlow = {
  type: 'token',
  authenticate: async () => {
    // Authentication is handled by the RegionSelectModal
    return {};
  },
  validate,
  loginComponent: DonatePayLoginButton,
  getAccessToken,
  revoke,
};

const pubsubFlow = buildCentrifugeFlow({
  version: '2',
  url: getCentrifugeUrl,
  parseMessage,
  subscribeParams: async () => ({
    access_token: getAccessToken(),
  }),
  id: 'donatePay',
  authFlow,
  getToken: getPubsubToken,
  getChannel: (userId) => `$public:${userId}`,
  subscribeEndpoint: getSubscribeEndpoint,
  cacheToken: true,
});

const donatePay: Integration.Config<TokenFlow> = {
  id: 'donatePay',
  type: 'donate',
  authFlow,
  pubsubFlow,
  branding: {
    icon: () => <DonatePaySvg className={styles.icon} />,
  },
};

export default donatePay;
