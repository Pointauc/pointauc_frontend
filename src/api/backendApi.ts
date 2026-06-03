import axios from 'axios';

import { getBackendOrigin } from '@shared/api/backendOrigin';

export const backendApi = axios.create({
  baseURL: getBackendOrigin(),
});
