import { backendApi } from '@api/backendApi';

import ENDPOINTS from '../constants/api.constants';
import { PatchRedemptionDto, PatchRedemptionsDto } from '../models/redemption.model';
import { TwitchRewardPresetsRequest } from '../models/user.model';

// eslint-disable-next-line import/prefer-default-export
export const authenticateTwitch = async (code: string): Promise<{ isNew: boolean }> => {
  const { data } = await backendApi.post(ENDPOINTS.TWITCH_AUTH, { code });

  return data;
};

export const closeTwitchRewards = async (): Promise<void> => {
  await backendApi.delete(ENDPOINTS.TWITCH_REWARDS);
};

export const updateRedemption = async (data: PatchRedemptionDto): Promise<void> => {
  await backendApi.patch(ENDPOINTS.TWITCH_REDEMPTIONS, data);
};

export const updateRedemptions = async (data: PatchRedemptionsDto): Promise<void> => {
  await backendApi.patch(ENDPOINTS.TWITCH_REDEMPTIONS_BATCH, data);
};

export const updateRewardPresets = async (data: TwitchRewardPresetsRequest): Promise<void> => {
  await backendApi.put(ENDPOINTS.TWITCH_REWARD_PRESETS, data);
};
