import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';

import CentrifugeV2 from '@domains/bids/external-integrations/shared/pubsub/Centrifuge/adapters/v2.ts';
import CentrifugeWebsocketV2 from '@domains/bids/external-integrations/shared/pubsub/Centrifuge/adapters/websocketV2.ts';
import { integrationUtils, InvalidTokenError } from '@domains/bids/external-integrations/shared/helpers.ts';
import { getUserId } from '@domains/bids/external-integrations/shared/getUserId.ts';
import * as Integration from '@models/integration';

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
  const store = new Store({
    subscribed: false,
    loading: false,
  });
  const events = new EventEmitter<Integration.PubsubEvents>();
  let centrifuge: CentrifugeFlow.Adapter;

  const connect = async (): Promise<void> => {
    try {
      store.setState({ subscribed: true, loading: true });
      const userId = getUserId(params.id);
      if (!userId) throw new Error('User not found');

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
      if (!token) throw new InvalidTokenError();

      await centrifuge.connect(token);
      store.setState({ subscribed: true, loading: false });
    } catch (e) {
      if (e instanceof InvalidTokenError) {
        void authFlow.revoke();
        store.setState({ subscribed: false, loading: false });
      }

      return Promise.reject(e);
    }
  };

  const disconnect = async (): Promise<void> => {
    await centrifuge?.disconnect();
    store.setState({ subscribed: false, loading: false });
  };

  return {
    events,
    store,
    connect,
    disconnect,
    invalidateToken: () => integrationUtils.session.remove(params.id, 'pubsubToken2'),
  };
};
