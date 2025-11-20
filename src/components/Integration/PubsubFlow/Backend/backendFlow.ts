import { Store } from '@tanstack/react-store';
import { io, Socket } from 'socket.io-client';

import EventEmitter from '@utils/EventEmitter';
import { getSocketIOUrl } from '@utils/url.utils';

interface Config {
  id: Integration.ID;
}

export class BackendFlow implements Integration.PubsubFlow {
  events = new EventEmitter<Integration.PubsubEvents>();
  store = new Store({
    subscribed: false,
    loading: true,
  });
  socket: Socket | null = null;
  id: Integration.ID;
  async = true;
  wasSubscribedBeforeDisconnect: boolean = false;

  constructor(params: Config) {
    this.id = params.id;
  }

  async createSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(`${getSocketIOUrl()}/${this.id}`, { query: { cookie: document.cookie } });

      this.socket.on('connect', () => {
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.socket = null;
        this.wasSubscribedBeforeDisconnect = this.store.state.subscribed;
        this.store.setState((state) => ({ ...state, subscribed: false, loading: false }));
        reject();
      });

      this.socket.on('reconnect', () => {
        if (this.wasSubscribedBeforeDisconnect) {
          this.connect();
          this.wasSubscribedBeforeDisconnect = false;
        }
      });

      this.socket.on('Bid', (bid: Bid.Item) => {
        this.events.emit('bid', { ...bid, source: 'ihaq' });
      });
    });
  }

  async connect(): Promise<void> {
    if (!this.socket) {
      await this.createSocketConnection();
    }

    this.store.setState((state) => ({ ...state, subscribed: true, loading: true }));
    this.socket?.emit('bidsSubscribe');
    await new Promise<void>((resolve, reject) => {
      this.socket?.once('bidsStateChange', ({ state, error }) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    this.store.setState((state) => ({ ...state, subscribed: true, loading: false }));
  }

  async disconnect(): Promise<void> {
    if (!this.socket) return;

    this.store.setState((state) => ({ ...state, subscribed: false, loading: true }));
    this.socket.emit('bidsUnsubscribe');
    await new Promise<void>((resolve, reject) => {
      this.socket?.once('bidsStateChange', ({ state, error }) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
    this.store.setState((state) => ({ ...state, subscribed: false, loading: false }));
  }
}
