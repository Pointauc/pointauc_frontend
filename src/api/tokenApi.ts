import { backendApi } from '@api/backendApi';
import ENDPOINTS from '@constants/api.constants.ts';

export const loadToken = async (): Promise<string> => {
  const { data } = await backendApi.get(ENDPOINTS.PUBLIC_API.TOKEN);

  return data;
};

export const updateToken = async (): Promise<string> => {
  const { data } = await backendApi.post(ENDPOINTS.PUBLIC_API.TOKEN);

  return data;
};
