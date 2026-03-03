import { Store } from '@tanstack/react-store';
import { io, Socket } from 'socket.io-client';
import EventEmitter from 'eventemitter3';

import { getSocketIOUrl } from '@utils/url.utils';
import * as Integration from '@models/integration';

interface Config {
  id: Integration.ID;
  connectErrorHandler?: (error: Error) => void;
}

export class BackendFlow implements Integration.PubsubFlow {
  events = new EventEmitter<Integration.PubsubEvents>();
  store = new Store({
    subscribed: false,
    loading: false,
  });
  socket: Socket | null = null;
  id: Integration.ID;
  wasSubscribedBeforeDisconnect: boolean = false;
  connectErrorHandler?: (error: Error) => void;

  constructor(params: Config) {
    this.id = params.id;
    this.connectErrorHandler = params.connectErrorHandler;
  }

  restorePreviousState(): void {
    if (this.wasSubscribedBeforeDisconnect) {
      this.connect();
      this.wasSubscribedBeforeDisconnect = false;
    }
  }

  async createSocketConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(`${getSocketIOUrl()}/${this.id}`, {
        query: { cookie: document.cookie },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        this.store.setState((state) => ({ ...state, loading: false }));
        this.restorePreviousState();
        resolve();
      });

      this.socket.on('disconnect', () => {
        this.socket = null;
        this.wasSubscribedBeforeDisconnect = this.store.state.subscribed;
        this.store.setState((state) => ({ ...state, loading: true }));
        reject();
      });

      this.socket.on('reconnect', () => {
        this.restorePreviousState();
      });

      this.socket.on('Bid', (bid: Bid.Item) => {
        this.events.emit('bid', { ...bid, source: this.id });
      });
    });
  }

  async connect(): Promise<void> {
    this.store.setState({ subscribed: true, loading: true });
    if (!this.socket) {
      await this.createSocketConnection();
    }

    this.socket?.emit('bidsSubscribe');
    await new Promise<void>((resolve, reject) => {
      this.socket?.once('bidsStateChange', ({ state, error }) => {
        this.store.setState({ subscribed: state, loading: false });
        if (error) {
          this.connectErrorHandler?.(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.socket) return;

    this.store.setState({ subscribed: false, loading: true });
    this.socket.emit('bidsUnsubscribe');
    await new Promise<void>((resolve, reject) => {
      this.socket?.once('bidsStateChange', ({ state, error }) => {
        this.store.setState({ subscribed: state, loading: false });
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
