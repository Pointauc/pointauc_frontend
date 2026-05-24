import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';
import { client as createTmiClient, type ChatUserstate, type Client } from 'tmi.js';

import * as Integration from '@models/integration';

const normalizeChannel = (channel: string) => channel.trim().replace(/^#/, '').toLowerCase();

const getChatUsername = (tags: ChatUserstate) =>
  tags.username ?? tags['display-name'] ?? tags.login ?? 'unknown';

export class TwitchChatIntegration implements Integration.ChatIntegrationFlow {
  events = new EventEmitter<Integration.ChatIntegrationEvents>();
  store = new Store<Integration.ChatIntegrationSubscription>({
    connected: false,
    loading: false,
    error: null,
    channel: null,
  });
  private client: Client | null = null;

  async connect(channel: string): Promise<void> {
    const normalizedChannel = normalizeChannel(channel);

    if (!normalizedChannel) {
      this.store.setState((state) => ({
        ...state,
        connected: false,
        loading: false,
        error: 'Missing Twitch channel',
        channel: null,
      }));
      return;
    }

    if (this.store.state.connected && this.store.state.channel === normalizedChannel) {
      return;
    }

    await this.disconnect();
    this.store.setState({
      connected: false,
      loading: true,
      error: null,
      channel: normalizedChannel,
    });

    this.client = createTmiClient({
      options: {
        skipMembership: true,
        skipUpdatingEmotesets: true,
      },
      connection: {
        reconnect: true,
        secure: true,
      },
      channels: [normalizedChannel],
    });

    this.client.on('message', (messageChannel, tags, message, self) => {
      if (self) {
        return;
      }

      this.events.emit('message', {
        channel: messageChannel.replace(/^#/, ''),
        username: getChatUsername(tags),
        userId: tags['user-id'] ?? null,
        message,
        timestamp: new Date(Number(tags['tmi-sent-ts']) || Date.now()).toISOString(),
        rawTags: tags,
      });
    });

    this.client.on('disconnected', (reason) => {
      this.store.setState((state) => ({
        ...state,
        connected: false,
        loading: false,
        error: reason || state.error,
      }));
    });

    try {
      await this.client.connect();
      this.store.setState((state) => ({
        ...state,
        connected: true,
        loading: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.store.setState((state) => ({
        ...state,
        connected: false,
        loading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    const currentClient = this.client;
    this.client = null;

    if (!currentClient) {
      this.store.setState((state) => ({ ...state, connected: false, loading: false }));
      return;
    }

    this.store.setState((state) => ({ ...state, loading: true }));

    try {
      await currentClient.disconnect();
    } finally {
      this.store.setState((state) => ({
        ...state,
        connected: false,
        loading: false,
        channel: null,
      }));
    }
  }
}
