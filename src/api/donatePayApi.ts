import axios from 'axios';

import { InvalidTokenError } from '@components/Integration/helpers.ts';

import ENDPOINTS from '../constants/api.constants';

/**
 * Fetches pubsub token from DonatePay RU API.
 * This is a direct request to DonatePay servers, not our backend.
 */
export const pubsubTokenRu = async (accessToken: string): Promise<string> => {
  const { data } = await axios.post(ENDPOINTS.DONATE_PAY.TOKEN, { access_token: accessToken });

  if (!data.token && data.message === 'Incorrect token') {
    return Promise.reject(new InvalidTokenError());
  }

  return data.token;
};

/**
 * Fetches pubsub token from DonatePay EU API.
 * This is a direct request to DonatePay servers, not our backend.
 */
export const pubsubTokenEu = async (accessToken: string): Promise<string> => {
  const { data } = await axios.post(ENDPOINTS.DONATE_PAY_EU.TOKEN, { access_token: accessToken });

  if (!data.token && data.message === 'Incorrect token') {
    return Promise.reject(new InvalidTokenError());
  }

  return data.token;
};

const donatePayApi = {
  pubsubTokenRu,
  pubsubTokenEu,
};

export default donatePayApi;
