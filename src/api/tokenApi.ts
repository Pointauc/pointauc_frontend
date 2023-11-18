import axios from 'axios';

import ENDPOINTS from '@constants/api.constants.ts';

export const loadToken = async (): Promise<string> => {
  const { data } = await axios.get(ENDPOINTS.PUBLIC_API.TOKEN);

  return data;
};

export const updateToken = async (): Promise<string> => {
  const { data } = await axios.post(ENDPOINTS.PUBLIC_API.TOKEN);

  return data;
};
