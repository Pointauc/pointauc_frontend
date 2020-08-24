import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

// eslint-disable-next-line import/prefer-default-export
export const authenticateTwitch = async (code: string): Promise<void> => {
  return axios.post(ENDPOINTS.TWITCH_AUTH, { code });
};
