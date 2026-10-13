import { backendApi } from '@api/backendApi';
import {
  DesktopSyncClaimResponse,
  DesktopSyncDataPayload,
  DesktopSyncSession,
  DesktopSyncStatusResponse,
} from '@domains/desktop/model/types';

export const createDesktopSyncSession = async (): Promise<DesktopSyncSession> => {
  const { data } = await backendApi.post<DesktopSyncSession>('/api/data-sync/session');
  return data;
};

export const fetchDesktopSyncStatus = async (sessionId: string): Promise<DesktopSyncStatusResponse> => {
  const { data } = await backendApi.get<DesktopSyncStatusResponse>(
    `/api/data-sync/status/${encodeURIComponent(sessionId)}`,
  );
  return data;
};

export const uploadDesktopSyncData = async (sessionId: string, data: DesktopSyncDataPayload): Promise<void> => {
  await backendApi.post('/api/data-sync/upload', { sessionId, data });
};

export const claimDesktopSyncSession = async (
  sessionId: string,
  claimToken: string,
): Promise<DesktopSyncClaimResponse> => {
  const { data } = await backendApi.post<DesktopSyncClaimResponse>('/api/data-sync/claim', {
    sessionId,
    claimToken,
  });
  return data;
};
