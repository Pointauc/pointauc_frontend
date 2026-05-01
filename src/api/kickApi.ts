import axios from 'axios';

import ENDPOINTS from '@constants/api.constants';
import { PatchRedemptionDto, PatchRedemptionsDto } from '@models/redemption.model';

interface KickAuthPayload {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  state: string;
}

export const setKickAuthState = async (state: string): Promise<void> => {
  await axios.post(ENDPOINTS.KICK_AUTH_STATE, { state });
};

export const authenticateKick = async (payload: KickAuthPayload): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.KICK_AUTH, payload);
  return data;
};

export const revokeKick = async (): Promise<void> => {
  await axios.post(ENDPOINTS.KICK_REVOKE);
};

export const closeKickRewards = async (): Promise<void> => {
  await axios.delete(ENDPOINTS.KICK_REWARDS);
};

export const updateKickRedemption = async (data: PatchRedemptionDto): Promise<void> => {
  await axios.patch(ENDPOINTS.KICK_REDEMPTIONS, data);
};

export const updateKickRedemptions = async (data: PatchRedemptionsDto): Promise<void> => {
  await axios.patch(ENDPOINTS.KICK_REDEMPTIONS_BATCH, data);
};
