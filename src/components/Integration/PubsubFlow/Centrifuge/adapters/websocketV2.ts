import axios from 'axios';

import EventEmitter from '@utils/EventEmitter.ts';

interface SubscribeResponse {
  channels: { channel: string; token: string }[];
}

export default class CentrifugeWebsocketV2 implements CentrifugeFlow.Adapter {
  private centrifuge: WebSocket | null = null;
  private params: CentrifugeFlow.AdapterParams;
  private events: EventEmitter<Integration.PubsubEvents>;
  private parseMessage: CentrifugeFlow.AdapterParams['parseMessage'];

  private messageIdCounter: number = 1;

  private ready = false;
  private listening = false;

  constructor(params: CentrifugeFlow.AdapterParams) {
    this.params = params;
    this.events = params.events;
    this.parseMessage = params.parseMessage;
  }

  private handleDonation = (message: any) => {
    if (!this.listening) return;
    const bid = this.parseMessage(message);
    if (!bid) return;
    this.events.emit('bid', bid);
  };

  private sendTwoWayMessage(message: any, responseHandler?: (data: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.messageIdCounter;
      this.messageIdCounter += 1;

      const errorTimeout = setTimeout(() => {
        reject();
      }, 5000);

      const handleResponse = (response: MessageEvent) => {
        const data = JSON.parse(response.data);
        const isResponse = responseHandler ? responseHandler(data) : data.id === messageId;

        if (isResponse) {
          clearTimeout(errorTimeout);
          this.centrifuge?.removeEventListener('message', handleResponse);
          resolve(data);
        }
      };
      this.centrifuge?.addEventListener('message', handleResponse);
      this.centrifuge?.send(JSON.stringify({ ...message, id: messageId }));
    });
  }

  private async sendConnectToken(token: string): Promise<string> {
    return (await this.sendTwoWayMessage({ params: { token } })).result.client;
  }

  private async subscribeToChannel(client: string): Promise<void> {
    const { data } = await axios.post<SubscribeResponse>(
      this.params.subscribeEndpoint,
      { channels: [this.params.channel], client },
      { headers: this.params.subscribeHeaders },
    );

    await this.sendTwoWayMessage({ params: data.channels[0], method: 1 }, (data) => data.result.type === 1);
  }

  private createNewConnection(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.centrifuge = new WebSocket(this.params.url);

      this.centrifuge.addEventListener('message', (response: MessageEvent) => {
        const data = JSON.parse(response.data);

        if (data.result?.channel === this.params.channel && data.result?.data?.data?.name === 'Donations') {
          this.handleDonation(data.result.data.data);
        }
      });

      this.centrifuge.addEventListener(
        'open',
        async () => {
          this.ready = true;
          const client = await this.sendConnectToken(token);
          await this.subscribeToChannel(client);
          this.events.emit('subscribed');
          resolve();
        },
        { once: true },
      );

      this.centrifuge.addEventListener('close', () => {
        this.ready = false;
        this.events.emit('unsubscribed');
        reject();
      });
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
    this.centrifuge?.close();
    this.events.emit('unsubscribed');
  }
}
