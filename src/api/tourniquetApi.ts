import { backendApi } from '@api/backendApi';
import ENDPOINTS from '@constants/api.constants.ts';

export const authenticateTourniquet = async (requestId: string): Promise<{ isNew: boolean }> => {
  const { data } = await backendApi.post(ENDPOINTS.TOURNIQUET.AUTH, { requestId });

  return data;
};
