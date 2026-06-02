import { Purchase } from '@reducers/Purchases/Purchases';
import {
  buildVkVideoLiveRewardName,
  getVkVideoLivePaletteColor,
  VkVideoLiveReward,
  VkVideoLiveRewardDemand,
} from '@api/vkVideoLiveApi';
import { TwitchRewardPresetDto } from '@models/user.model';

interface VkVideoLivePublication {
  data?: {
    demand?: VkVideoLiveRewardDemand;
    type?: string;
  } & VkVideoLiveRewardDemand;
  demand?: VkVideoLiveRewardDemand;
  type?: string;
}

const EVENT_TYPE = 'channel_points_reward_demand_create';

const buildTimestamp = (createdAt?: number | string): string => {
  if (!createdAt) {
    return new Date().toISOString();
  }

  const numericDate = Number(createdAt);
  if (Number.isFinite(numericDate)) {
    return new Date(numericDate < 10_000_000_000 ? numericDate * 1000 : numericDate).toISOString();
  }

  const parsedDate = new Date(createdAt);
  return Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
};

const buildMessage = (demand: VkVideoLiveRewardDemand): string | undefined => {
  if (demand.message) {
    return demand.message;
  }

  const parts = demand.message_parts
    ?.map((part) => part.text?.content ?? part.link?.url ?? part.mention?.nick ?? part.smile?.name ?? '')
    .filter(Boolean)
    .join(' ')
    .trim();

  return parts || undefined;
};

const getDemand = (publication: VkVideoLivePublication): VkVideoLiveRewardDemand | undefined => {
  const payload = publication.data ?? publication;

  if (publication.type && publication.type !== EVENT_TYPE) {
    return undefined;
  }

  if (payload.type && payload.type !== EVENT_TYPE) {
    return undefined;
  }

  return payload.demand ?? (payload as VkVideoLiveRewardDemand);
};

const getConfiguredRewardColor = (
  reward: VkVideoLiveReward,
  rewardPresets: TwitchRewardPresetDto[],
  rewardsPrefix: string,
): string | undefined =>
  rewardPresets.find((preset) => buildVkVideoLiveRewardName(rewardsPrefix, preset.cost) === reward.name)?.color ??
  rewardPresets.find((preset) => preset.cost === reward.price)?.color;

export const parseVkVideoLivePurchase = (
  publication: VkVideoLivePublication,
  rewardsById: Map<string, VkVideoLiveReward>,
  rewardPresets: TwitchRewardPresetDto[],
  rewardsPrefix: string,
): Purchase | null => {
  const demand = getDemand(publication);
  const rewardId = demand?.reward?.id;

  if (!demand || !rewardId) {
    return null;
  }

  const reward = rewardsById.get(String(rewardId));
  if (!reward) {
    return null;
  }

  return {
    id: String(demand.id),
    rewardId: String(rewardId),
    username: demand.user?.nick ?? demand.user?.username ?? '',
    message: buildMessage(demand),
    timestamp: buildTimestamp(demand.created_at),
    cost: reward.price,
    color:
      getConfiguredRewardColor(reward, rewardPresets, rewardsPrefix) ??
      getVkVideoLivePaletteColor(reward.background_color),
    source: 'vkVideoLive',
  };
};
