namespace CentrifugeFlow {
  import EventEmitter from '@utils/EventEmitter.ts';
  import { Purchase } from '@reducers/Purchases/Purchases.ts';

  type Version = '2';

  interface AdapterParams {
    url: string;
    events: EventEmitter<Integration.PubsubEvents>;
    parseMessage: (data: any) => Purchase;
    userId: string;
    accessToken: string;
  }

  declare class Adapter {
    constructor(params: AdapterParams);
    connect: (token: string) => Promise<void>;
    disconnect: () => Promise<void>;
  }
}
