import Centrifuge from 'centrifuge2';

import EventEmitter from '@utils/EventEmitter.ts';

export default class CentrifugeV2 implements CentrifugeFlow.Adapter {
  private centrifuge: Centrifuge;
  private events: EventEmitter<Integration.PubsubEvents>;
  private parseMessage: CentrifugeFlow.AdapterParams['parseMessage'];

  private ready = false;
  private listening = false;

  constructor(params: CentrifugeFlow.AdapterParams) {
    this.centrifuge = new Centrifuge(params.url, {
      subscribeEndpoint: 'https://donatepay.ru/api/v2/socket/token',
      subscribeParams: {
        access_token: params.accessToken,
      },
      disableWithCredentials: true,
    });
    this.events = params.events;
    this.parseMessage = params.parseMessage;

    this.centrifuge.subscribe(`$public:${params.userId}`, this.handleDonation);

    this.centrifuge.on('connect', () => {
      this.ready = true;
      this.events.emit('subscribed');
    });

    this.centrifuge.on('disconnect', () => {
      this.ready = false;
      this.events.emit('unsubscribed');
    });
  }

  private handleDonation = (message: any) => {
    if (!this.listening) return;
    this.events.emit('bid', this.parseMessage(message));
  };

  private createNewConnection(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.centrifuge.setToken(token);

      const timeout = setTimeout(reject, 7000);

      this.centrifuge.once('error', reject);
      this.centrifuge.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.centrifuge.connect();
    });
  }

  async connect(token: string): Promise<void> {
    if (!this.ready) {
      await this.createNewConnection(token);
    } else {
      this.events.emit('subscribed');
    }

    this.listening = true;
  }

  async disconnect(): Promise<void> {
    this.listening = false;
    this.events.emit('unsubscribed');
  }
}
