import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';
import { PatchRedemptionDto } from '../models/redemption.model';

// eslint-disable-next-line import/prefer-default-export
export const authenticateTwitch = async (code: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.TWITCH_AUTH, { code });

  return data;
};

export const authenticateDA = async (code: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.DA_AUTH, { code, redirect_uri: `${window.location.origin}/da/redirect` });

  return data;
};

export const closeTwitchRewards = async (): Promise<void> => {
  await axios.delete(ENDPOINTS.TWITCH_REWARDS);
};

export const updateRedemption = async (data: PatchRedemptionDto): Promise<void> => {
  await axios.patch(ENDPOINTS.TWITCH_REDEMPTIONS, data);
};
