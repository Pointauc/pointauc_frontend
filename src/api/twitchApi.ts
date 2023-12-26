import axios from 'axios';

import ENDPOINTS from '../constants/api.constants';
import { PatchRedemptionDto } from '../models/redemption.model';
import { TwitchRewardPresetsRequest } from '../models/user.model';

export const authenticateTwitch = async (code: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.TWITCH_AUTH, { code });

  return data;
};

export const closeTwitchRewards = async (): Promise<void> => {
  await axios.delete(ENDPOINTS.TWITCH_REWARDS);
};

export const updateRedemption = async (data: PatchRedemptionDto): Promise<void> => {
  await axios.patch(ENDPOINTS.TWITCH_REDEMPTIONS, data);
};

export const updateRewardPresets = async (data: TwitchRewardPresetsRequest): Promise<void> => {
  await axios.put(ENDPOINTS.TWITCH_REWARD_PRESETS, data);
};
