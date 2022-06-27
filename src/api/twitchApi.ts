import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

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
