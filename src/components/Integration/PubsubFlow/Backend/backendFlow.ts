import EventEmitter from '@utils/EventEmitter.ts';

interface Params {
  sendSubscribeState: (isSubscribed: boolean) => Promise<void>;
}

export const buildBackendFlow = (params: Params): Integration.PubsubFlow => {
  return {
    events: new EventEmitter<Integration.PubsubEvents>(),
    connect: async () => {
      await params.sendSubscribeState(true);
    },
    disconnect: async () => {
      await params.sendSubscribeState(false);
    },
    async: false,
  };
};
