import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import ENDPOINTS from '@constants/api.constants';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers';
import { PatchRedemptionDto, PatchRedemptionsDto, RedemptionStatus } from '@models/redemption.model';
import { TwitchRewardPresetsRequest } from '@models/user.model';

const INTEGRATION_ID = 'vkVideoLive';
const API_BASE_URL = 'https://api.live.vkvideo.ru';

interface AuthResponse {
  isNew: boolean;
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  auth: {
    id: string;
    username: string;
    channelUrl?: string;
    isValid: boolean;
  };
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

interface ApiResponse<T> {
  data: T;
}

interface CurrentUserResponse {
  channel?: { url: string };
  channels?: { url: string }[];
  user: {
    id: number;
    nick: string;
  };
}

export interface VkVideoLiveRewardPreset {
  cost: number;
  color: string;
}

export interface VkVideoLiveReward {
  background_color: number;
  description: string;
  id: string;
  is_disabled?: boolean;
  is_message_required: boolean;
  max_uses_count?: number;
  max_uses_count_per_user?: number;
  name: string;
  price: number;
  repair_timeout: number;
}

type VkVideoLiveRewardRequest = Omit<VkVideoLiveReward, 'id'> & { id?: string };

interface RewardsManageResponse {
  rewards: VkVideoLiveReward[];
}

interface CreateRewardResponse {
  reward: { id: string };
}

interface WebsocketTokenResponse {
  token: string;
}

interface WebsocketSubscriptionTokenResponse {
  channel_tokens: { channel: string; token: string }[];
}

interface ChannelResponse {
  channel: {
    web_socket_channels?: {
      channel_points?: string;
      private_channel_points?: string;
    };
  };
}

type RequestConfig = AxiosRequestConfig & { hasRetried?: boolean };

const setStoredToken = (token: string): void => {
  integrationUtils.storage.set(INTEGRATION_ID, 'authToken', token);
};

const clearStoredToken = (): void => {
  integrationUtils.storage.remove(INTEGRATION_ID, 'authToken');
  integrationUtils.session.remove(INTEGRATION_ID, 'pubsubToken2');
};

export const vkVideoLiveAuthApi = {
  authenticate: async (code: string, redirectUri: string): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(ENDPOINTS.VK_VIDEO_LIVE_AUTH, {
      code,
      redirect_uri: redirectUri,
    });
    setStoredToken(data.accessToken);
    return data;
  },
  refresh: async (): Promise<RefreshResponse> => {
    const { data } = await axios.post<RefreshResponse>(ENDPOINTS.VK_VIDEO_LIVE_REFRESH);
    setStoredToken(data.accessToken);
    return data;
  },
  revoke: async (): Promise<void> => {
    try {
      await axios.post(ENDPOINTS.VK_VIDEO_LIVE_REVOKE);
    } finally {
      clearStoredToken();
    }
  },
  getAccessToken: (): string => integrationUtils.storage.get(INTEGRATION_ID, 'authToken') ?? '',
  clearToken: clearStoredToken,
};

export class VkVideoLiveApiClient {
  private readonly client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;
  private handleAuthLost?: () => void;

  constructor(params: { handleAuthLost?: () => void } = {}) {
    this.handleAuthLost = params.handleAuthLost;
    this.client = axios.create({ baseURL: API_BASE_URL });
    this.client.interceptors.request.use((config) => {
      const accessToken = vkVideoLiveAuthApi.getAccessToken();

      if (accessToken) {
        config.headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return config;
    });
  }

  setAuthLostHandler(handler: () => void): void {
    this.handleAuthLost = handler;
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      this.refreshPromise = vkVideoLiveAuthApi
        .refresh()
        .then(({ accessToken }) => accessToken)
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    try {
      const { data } = await this.client.request<T>(config);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      if (status === 401 && !config.hasRetried) {
        try {
          const accessToken = await this.refreshAccessToken();
          return this.request<T>({
            ...config,
            hasRetried: true,
            headers: { ...config.headers, Authorization: `Bearer ${accessToken}` },
          });
        } catch (refreshError) {
          clearStoredToken();
          this.handleAuthLost?.();
          throw refreshError;
        }
      }

      throw error;
    }
  }

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await this.request<ApiResponse<CurrentUserResponse>>({ method: 'GET', url: '/v1/current_user' });
    return response.data;
  }

  async getChannel(channelUrl: string): Promise<ChannelResponse> {
    const response = await this.request<ApiResponse<ChannelResponse>>({
      method: 'GET',
      url: '/v1/channel',
      params: { channel_url: channelUrl },
    });
    return response.data;
  }

  async getWebsocketToken(): Promise<string> {
    const response = await this.request<ApiResponse<WebsocketTokenResponse>>({
      method: 'GET',
      url: '/v1/websocket/token',
    });
    return response.data.token;
  }

  async getSubscriptionToken(channel: string): Promise<string | undefined> {
    const response = await this.request<ApiResponse<WebsocketSubscriptionTokenResponse>>({
      method: 'GET',
      url: '/v1/websocket/subscription_token',
      params: { channels: channel },
    });

    return response.data.channel_tokens.find((item) => item.channel === channel)?.token;
  }

  async getManageRewards(channelUrl: string): Promise<VkVideoLiveReward[]> {
    const response = await this.request<ApiResponse<RewardsManageResponse>>({
      method: 'GET',
      url: '/v1/channel_point/rewards/manage_info',
      params: { channel_url: channelUrl },
    });

    return response.data.rewards;
  }

  async createReward(channelUrl: string, reward: VkVideoLiveRewardRequest): Promise<string> {
    const response = await this.request<ApiResponse<CreateRewardResponse>>({
      method: 'POST',
      url: '/v1/channel_point/reward/create',
      params: { channel_url: channelUrl },
      data: { reward },
    });

    return response.data.reward.id;
  }

  async editReward(channelUrl: string, rewardId: string, reward: VkVideoLiveRewardRequest): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/v1/channel_point/reward/edit',
      params: { channel_url: channelUrl, reward_id: rewardId },
      data: { reward },
    });
  }

  async setRewardEnabled(channelUrl: string, rewardId: string, enabled: boolean): Promise<void> {
    await this.request({
      method: 'POST',
      url: `/v1/channel_point/reward/${enabled ? 'enable' : 'disable'}`,
      params: { channel_url: channelUrl, reward_id: rewardId },
    });
  }

  async deleteReward(channelUrl: string, rewardId: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/v1/channel_point/reward/delete',
      params: { channel_url: channelUrl, reward_id: rewardId },
    });
  }

  async setDemandStatus(channelUrl: string, demandIds: Array<string | number>, status: RedemptionStatus): Promise<void> {
    await this.request({
      method: 'POST',
      url: `/v1/channel_point/reward/demand/${status === RedemptionStatus.Fulfilled ? 'accept' : 'reject'}`,
      params: { channel_url: channelUrl },
      data: { demands: demandIds.map((id) => ({ id: Number(id) })) },
    });
  }
}

export const vkVideoLiveApiClient = new VkVideoLiveApiClient();

export const buildVkVideoLiveRewardName = (prefix: string, cost: number): string => `${prefix} ${cost}`;

const VK_REWARD_COLORS = [
  '#e3924c',
  '#d95d39',
  '#f2c14e',
  '#7fb069',
  '#3a86ff',
  '#4361ee',
  '#8338ec',
  '#ff006e',
  '#00a896',
  '#02c39a',
  '#577590',
  '#4d908e',
  '#f94144',
  '#f3722c',
  '#90be6d',
  '#9b5de5',
];

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized.length === 3 ? normalized.replace(/(.)/g, '$1$1') : normalized, 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export const getVkVideoLivePaletteColor = (index: number): string => VK_REWARD_COLORS[index] ?? VK_REWARD_COLORS[0];

export const getNearestVkVideoLiveColorIndex = (hex: string): number => {
  const [red, green, blue] = hexToRgb(hex);

  return VK_REWARD_COLORS.reduce(
    (best, color, index) => {
      const [colorRed, colorGreen, colorBlue] = hexToRgb(color);
      const distance = (red - colorRed) ** 2 + (green - colorGreen) ** 2 + (blue - colorBlue) ** 2;

      return distance < best.distance ? { distance, index } : best;
    },
    { distance: Infinity, index: 0 },
  ).index;
};

export const vkVideoLiveRewardsApi = {
  openRewards: async ({ presets, prefix }: Omit<TwitchRewardPresetsRequest, 'settingsId'>, channelUrl: string) => {
    const existingRewards = await vkVideoLiveApiClient.getManageRewards(channelUrl);
    const existingByName = new Map(existingRewards.map((reward) => [reward.name, reward]));

    const activeRewards = await Promise.all(
      presets.map(async ({ cost, color }) => {
        const name = buildVkVideoLiveRewardName(prefix, cost);
        const reward: VkVideoLiveRewardRequest = {
          background_color: getNearestVkVideoLiveColorIndex(color),
          description: '',
          id: existingByName.get(name)?.id,
          is_message_required: true,
          name,
          price: cost,
          repair_timeout: 0,
        };
        const existing = existingByName.get(name);

        if (existing) {
          await vkVideoLiveApiClient.editReward(channelUrl, existing.id, { ...existing, ...reward, id: existing.id });
          await vkVideoLiveApiClient.setRewardEnabled(channelUrl, existing.id, true);
          return { ...existing, ...reward, id: existing.id };
        }

        const id = await vkVideoLiveApiClient.createReward(channelUrl, reward);
        return { ...reward, id };
      }),
    );

    return activeRewards;
  },
  hideRewards: async (channelUrl: string) => {
    const rewards = await vkVideoLiveApiClient.getManageRewards(channelUrl);
    await Promise.all(rewards.map((reward) => vkVideoLiveApiClient.setRewardEnabled(channelUrl, reward.id, false)));
  },
  deleteRewards: async (channelUrl: string) => {
    const rewards = await vkVideoLiveApiClient.getManageRewards(channelUrl);
    await Promise.all(rewards.map((reward) => vkVideoLiveApiClient.deleteReward(channelUrl, reward.id)));
  },
  updateRedemption: async (data: PatchRedemptionDto, channelUrl: string) => {
    await vkVideoLiveApiClient.setDemandStatus(channelUrl, [data.redemptionId], data.status as RedemptionStatus);
  },
  updateRedemptions: async (data: PatchRedemptionsDto, channelUrl: string) => {
    const demandIds = data.rewards.flatMap(({ redemptions }) => redemptions);
    await vkVideoLiveApiClient.setDemandStatus(channelUrl, demandIds, data.status as RedemptionStatus);
  },
};
