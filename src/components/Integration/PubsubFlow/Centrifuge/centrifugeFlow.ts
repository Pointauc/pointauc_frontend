import EventEmitter from '@utils/EventEmitter.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import donatePayApi from '@api/donatePayApi.ts';
import CentrifugeV2 from '@components/Integration/PubsubFlow/Centrifuge/adapters/v2.ts';

interface Params {
  getAccessToken: () => string;
  version: CentrifugeFlow.Version;
  url: string;
  parseMessage: CentrifugeFlow.AdapterParams['parseMessage'];
}

const adapterMap: Record<CentrifugeFlow.Version, typeof CentrifugeFlow.Adapter> = {
  2: CentrifugeV2,
};

interface SessionToken {
  token: string;
  timestamp: number;
}

const getPubsubToken = async (): Promise<string | null> => {
  const sessionKey = integrationUtils.session.get('donatePay', 'pubsubToken2');
  const accessToken = integrationUtils.storage.get('donatePay', 'authToken');

  if (sessionKey) {
    const { token, timestamp } = JSON.parse(sessionKey) as SessionToken;
    if (Date.now() - timestamp < 1000 * 60 * 60 * 2) {
      return token;
    }
  }

  const token = accessToken && (await donatePayApi.pubsubToken(accessToken));
  if (token) {
    const tokenData = JSON.stringify({ token, timestamp: Date.now() });
    integrationUtils.session.set('donatePay', 'pubsubToken2', tokenData);
  }

  return token;
};

export const buildCentrifugeFlow = (params: Params): Integration.PubsubFlow => {
  const { url, version, parseMessage } = params;
  const events = new EventEmitter<Integration.PubsubEvents>();
  let centrifuge: CentrifugeFlow.Adapter;

  const connect = async (userId: string): Promise<void> => {
    if (!centrifuge) {
      const accessToken = params.getAccessToken();
      const adapterParams: CentrifugeFlow.AdapterParams = { url, events, parseMessage, userId, accessToken };
      centrifuge = new adapterMap[version](adapterParams);
    }

    const token = await getPubsubToken();
    if (!token) return;

    return centrifuge.connect(token);
  };

  const disconnect = async (): Promise<void> => {
    return centrifuge?.disconnect();
  };

  return { events, connect, disconnect, async: true };
};
