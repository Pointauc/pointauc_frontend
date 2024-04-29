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

const getPubsubToken = async (): Promise<string | null> => {
  const sessionKey = integrationUtils.session.get('donatePay', 'pubsubToken');
  const accessToken = integrationUtils.storage.get('donatePay', 'authToken');

  if (sessionKey) return sessionKey;

  const token = accessToken && (await donatePayApi.pubsubToken(accessToken));
  if (token) integrationUtils.session.set('donatePay', 'pubsubToken', token);

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
