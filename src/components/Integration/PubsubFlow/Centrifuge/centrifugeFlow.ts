import EventEmitter from '@utils/EventEmitter.ts';
import { integrationUtils, InvalidTokenError } from '@components/Integration/helpers.ts';
import CentrifugeV2 from '@components/Integration/PubsubFlow/Centrifuge/adapters/v2.ts';

interface Params {
  getAccessToken: () => string;
  version: CentrifugeFlow.Version;
  url: string;
  parseMessage: CentrifugeFlow.AdapterParams['parseMessage'];
  id: Integration.ID;
  authFlow: Integration.AuthFlow;
  getToken: () => Promise<string>;
}

const adapterMap: Record<CentrifugeFlow.Version, typeof CentrifugeFlow.Adapter> = {
  2: CentrifugeV2,
};

interface SessionToken {
  token: string;
  timestamp: number;
}

const getPubsubToken = async ({ id, getToken }: Params): Promise<string> => {
  const sessionKey = integrationUtils.session.get(id, 'pubsubToken2');

  if (sessionKey) {
    const { token, timestamp } = JSON.parse(sessionKey) as SessionToken;
    if (Date.now() - timestamp < 1000 * 60 * 60 * 2) {
      return token;
    }
  }

  const token = await getToken();

  const tokenData = JSON.stringify({ token, timestamp: Date.now() });
  integrationUtils.session.set(id, 'pubsubToken2', tokenData);

  return token;
};

export const buildCentrifugeFlow = (params: Params): Integration.PubsubFlow => {
  const { url, version, parseMessage, authFlow } = params;
  const events = new EventEmitter<Integration.PubsubEvents>();
  let centrifuge: CentrifugeFlow.Adapter;

  const connect = async (userId: string): Promise<void> => {
    if (!centrifuge) {
      const accessToken = params.getAccessToken();
      const adapterParams: CentrifugeFlow.AdapterParams = { url, events, parseMessage, userId, accessToken };
      centrifuge = new adapterMap[version](adapterParams);
    }

    try {
      const token = await getPubsubToken(params);

      return centrifuge.connect(token);
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        void authFlow.revoke();
      }

      return Promise.reject(e);
    }
  };

  const disconnect = async (): Promise<void> => {
    return centrifuge?.disconnect();
  };

  return { events, connect, disconnect, async: true };
};
