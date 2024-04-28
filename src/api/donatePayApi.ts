import axios from 'axios';

import ENDPOINTS from '../constants/api.constants';

export const authenticateDonatePay = async (accessToken: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.DONATE_PAY.AUTH, { accessToken });

  return data;
};

export const pubsubToken = async (accessToken: string): Promise<string> => {
  const { data } = await axios.post(ENDPOINTS.DONATE_PAY.TOKEN, { access_token: accessToken });

  return data.token;
};

const donatePayApi = {
  pubsubToken,
  authenticate: authenticateDonatePay,
};

export default donatePayApi;
