import EventEmitter from '@utils/EventEmitter.ts';

interface Params {
  sendSubscribeState: (isSubscribed: boolean) => void;
}

export const buildBackendFlow = (params: Params): Integration.PubsubFlow => {
  return {
    events: new EventEmitter<Integration.PubsubEvents>(),
    connect: async () => {
      params.sendSubscribeState(true);
    },
    disconnect: async () => {
      params.sendSubscribeState(false);
    },
    async: false,
  };
};
