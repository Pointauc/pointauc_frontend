import EventEmitter from '@utils/EventEmitter.ts';
import { integrationUtils, InvalidTokenError } from '@components/Integration/helpers.ts';
import CentrifugeV2 from '@components/Integration/PubsubFlow/Centrifuge/adapters/v2.ts';
import CentrifugeWebsocketV2 from '@components/Integration/PubsubFlow/Centrifuge/adapters/websocketV2.ts';

interface Params {
  version: CentrifugeFlow.Version;
  url: string | (() => string);
  parseMessage: CentrifugeFlow.AdapterParams['parseMessage'];
  id: Integration.ID;
  authFlow: Integration.AuthFlow;
  getToken: () => Promise<string | null | undefined>;
  subscribeEndpoint: string | (() => string);
  getChannel: (userId: string) => string | Promise<string>;
  subscribeParams?: () => any;
  subscribeHeaders?: () => any;
  cacheToken?: boolean;
}

const adapterMap: Record<CentrifugeFlow.Version, typeof CentrifugeFlow.Adapter> = {
  2: CentrifugeV2,
  websocketV2: CentrifugeWebsocketV2,
};

interface SessionToken {
  token: string;
  timestamp: number;
}

const getPubsubToken = async ({ id, getToken, cacheToken }: Params): Promise<string | null | undefined> => {
  const sessionKey = integrationUtils.session.get(id, 'pubsubToken2');

  if (cacheToken && sessionKey) {
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

const resolveValue = <T>(value: T | (() => T)): T => {
  return typeof value === 'function' ? (value as () => T)() : value;
};

interface CentrifugeFlow extends Integration.PubsubFlow {
  invalidateToken: () => void;
}

export const buildCentrifugeFlow = (params: Params): CentrifugeFlow => {
  const { version, parseMessage, authFlow, getChannel } = params;
  const events = new EventEmitter<Integration.PubsubEvents>();
  let centrifuge: CentrifugeFlow.Adapter;

  const connect = async (userId: string): Promise<void> => {
    try {
      if (!centrifuge) {
        const subscribeParams = await params.subscribeParams?.();
        const channel = await getChannel(userId);
        const url = resolveValue(params.url);
        const subscribeEndpoint = resolveValue(params.subscribeEndpoint);
        const adapterParams: CentrifugeFlow.AdapterParams = {
          url,
          events,
          parseMessage,
          userId,
          subscribeParams,
          subscribeHeaders: params.subscribeHeaders?.(),
          channel,
          subscribeEndpoint,
        };
        centrifuge = new adapterMap[version](adapterParams);
      }

      const token = await getPubsubToken(params);
      console.log(token);
      if (!token) throw new InvalidTokenError();

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

  return {
    events,
    connect,
    disconnect,
    async: true,
    invalidateToken: () => integrationUtils.session.remove(params.id, 'pubsubToken2'),
  };
};
