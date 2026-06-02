import { Centrifuge, Subscription } from 'centrifuge';
import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';

import { vkVideoLiveApiClient, vkVideoLiveRewardsApi, VkVideoLiveReward } from '@api/vkVideoLiveApi';
import * as Integration from '@models/integration';
import { mergeAuthData } from '@reducers/User/User';
import { store as appStore } from '@store';

import { parseVkVideoLivePurchase } from './message';

const PUBSUB_URL = 'wss://pubsub-dev.live.vkvideo.ru/connection/websocket?format=json&cf_protocol_version=v2';

export class VkVideoLivePubsubFlow implements Integration.PubsubFlow {
  events = new EventEmitter<Integration.PubsubEvents>();
  store = new Store<Integration.PubsubSubscription>({
    subscribed: false,
    loading: false,
  });
  private client: Centrifuge | null = null;
  private subscription: Subscription | null = null;
  private rewardsById = new Map<string, VkVideoLiveReward>();

  constructor() {
    vkVideoLiveApiClient.setAuthLostHandler(() => {
      this.handleAuthLost();
    });
  }

  private handleAuthLost(): void {
    this.disconnect();
    appStore.dispatch(mergeAuthData({ vkVideoLive: undefined }));
  }

  private getChannelUrl(): string {
    const channelUrl = appStore.getState().user.authData.vkVideoLive?.channelUrl;

    if (!channelUrl) {
      throw new Error('VK Video Live channel URL is missing');
    }

    return channelUrl;
  }

  private async openRewards(channelUrl: string): Promise<void> {
    const {
      aucSettings: {
        settings: { rewardPresets, rewardsPrefix },
      },
    } = appStore.getState();
    const rewards = await vkVideoLiveRewardsApi.openRewards(
      { presets: rewardPresets, prefix: rewardsPrefix },
      channelUrl,
    );

    this.rewardsById = new Map(rewards.map((reward) => [String(reward.id), reward]));
  }

  private async getChannelPointsChannel(channelUrl: string): Promise<string> {
    const channelData = await vkVideoLiveApiClient.getChannel(channelUrl);
    const channels = channelData.channel.web_socket_channels;
    const channelPointsChannel = channels?.private_channel_points ?? channels?.channel_points;

    if (!channelPointsChannel) {
      throw new Error('VK Video Live channel-points websocket channel is missing');
    }

    return channelPointsChannel;
  }

  private subscribe(channel: string, subscriptionToken?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.client?.newSubscription(channel, subscriptionToken ? { token: subscriptionToken } : {});
      this.subscription = subscription ?? null;

      if (!subscription) {
        reject(new Error('VK Video Live websocket subscription was not created'));
        return;
      }

      subscription.on('publication', (ctx) => {
        const {
          aucSettings: {
            settings: { rewardPresets, rewardsPrefix },
          },
        } = appStore.getState();
        const purchase = parseVkVideoLivePurchase(ctx.data, this.rewardsById, rewardPresets, rewardsPrefix);
        if (purchase) {
          this.events.emit('bid', purchase);
        }
      });
      subscription.on('subscribed', () => resolve());
      subscription.on('error', (ctx) => reject(ctx.error));
      subscription.subscribe();
    });
  }

  async connect(): Promise<void> {
    this.store.setState({ subscribed: true, loading: true });

    try {
      const channelUrl = this.getChannelUrl();
      await this.openRewards(channelUrl);

      const [token, channel] = await Promise.all([
        vkVideoLiveApiClient.getWebsocketToken(),
        this.getChannelPointsChannel(channelUrl),
      ]);
      const subscriptionToken = await vkVideoLiveApiClient.getSubscriptionToken(channel).catch(() => undefined);

      this.client = new Centrifuge(PUBSUB_URL, { token });
      const connectedPromise = new Promise<void>((resolve, reject) => {
        this.client?.on('connected', () => resolve());
        this.client?.on('error', (ctx) => reject(ctx.error));
      });

      const subscribedPromise = this.subscribe(channel, subscriptionToken);
      this.client.connect();

      await Promise.all([connectedPromise, subscribedPromise]);
      this.store.setState({ subscribed: true, loading: false });
    } catch (err) {
      console.error('VK Video Live pubsub connection error:', err);
      this.store.setState({ subscribed: false, loading: false });
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    this.store.setState({ subscribed: false, loading: true });
    const channelUrl = appStore.getState().user.authData.vkVideoLive?.channelUrl;

    this.subscription?.unsubscribe();
    this.subscription = null;
    this.client?.disconnect();
    this.client = null;
    this.rewardsById = new Map();

    if (channelUrl) {
      await vkVideoLiveRewardsApi.hideRewards(channelUrl).catch(() => undefined);
    }

    this.store.setState({ subscribed: false, loading: false });
  }
}
