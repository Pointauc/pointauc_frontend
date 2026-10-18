import { backendApi } from '@api/backendApi';

import { RecoveryUploadPayload, RecoveryUploadResponse } from '../model/types';

export const uploadRecoveryData = async (
  payload: RecoveryUploadPayload,
): Promise<RecoveryUploadResponse> => {
  const { data } = await backendApi.post<RecoveryUploadResponse>('/api/recovery', payload);
  return data;
};
