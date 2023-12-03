import axios from 'axios';

import ENDPOINTS from '../constants/api.constants';

export const authenticateDA = async (code: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.DA_AUTH, { code, redirect_uri: `${window.location.origin}/da/redirect` });

  return data;
};
