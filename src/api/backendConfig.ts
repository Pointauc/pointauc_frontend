import { backendApi } from '@api/backendApi';
import { client } from '@api/openapi/client.gen';
import { getBackendApiBaseUrl } from '@shared/api/backendOrigin';

export const setupBackendApiConfig = (): void => {
  client.setConfig({ axios: backendApi, baseURL: getBackendApiBaseUrl() });
};
