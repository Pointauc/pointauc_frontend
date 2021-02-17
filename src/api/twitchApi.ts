import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

// eslint-disable-next-line import/prefer-default-export
export const authenticateTwitch = async (code: string): Promise<void> => {
  return axios.post(ENDPOINTS.TWITCH_AUTH, { code });
};

export const authenticateDA = async (code: string): Promise<void> => {
  return axios.post(ENDPOINTS.DA_AUTH, { code, redirectUri: `${window.location.origin}/da/redirect` });
};

export const closeTwitchRewards = async (): Promise<void> => {
  await axios.delete(ENDPOINTS.TWITCH_REWARDS);
};
