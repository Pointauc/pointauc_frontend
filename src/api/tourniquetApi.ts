import axios from 'axios';

import ENDPOINTS from '@constants/api.constants.ts';

export const authenticateTourniquet = async (requestId: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.TOURNIQUET.AUTH, { requestId });

  return data;
};
