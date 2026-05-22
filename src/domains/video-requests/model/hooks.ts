import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { videoRequestsRepository } from '@domains/video-requests/api/VideoRequestsRepository';
import {
  CreateRejectedVideoRequestInput,
  CreateVideoRequestHistoryInput,
  CreateVideoRequestInput,
  VideoRequest,
  VideoRequestSettings,
  VideoRequestSettingsPatch,
} from '@domains/video-requests/model/types';

const VIDEO_REQUESTS_QUERY_KEYS = {
  all: ['video-requests'] as const,
  queue: ['video-requests', 'queue'] as const,
  settings: ['video-requests', 'settings'] as const,
  rejections: ['video-requests', 'rejections'] as const,
  history: ['video-requests', 'history'] as const,
  request: (id: string) => ['video-requests', 'queue', id] as const,
};

const invalidateQueueQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.queue }),
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.all }),
  ]);
};

export const useVideoRequestQueue = () =>
  useQuery({
    queryKey: VIDEO_REQUESTS_QUERY_KEYS.queue,
    queryFn: () => videoRequestsRepository.listRequests(),
  });

export const useVideoRequest = (id: string) =>
  useQuery({
    queryKey: VIDEO_REQUESTS_QUERY_KEYS.request(id),
    queryFn: () => videoRequestsRepository.getRequest(id),
    enabled: Boolean(id),
  });

export const useCreateVideoRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVideoRequestInput) => videoRequestsRepository.createRequest(input),
    onSuccess: async () => {
      await invalidateQueueQueries(queryClient);
    },
  });
};

export const useUpdateVideoRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<VideoRequest, 'id' | 'createdAt'>>;
    }) => videoRequestsRepository.updateRequest(id, updates),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateQueueQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.request(variables.id) }),
      ]);
    },
  });
};

export const useDeleteVideoRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => videoRequestsRepository.deleteRequest(id),
    onSuccess: async (_, id) => {
      await Promise.all([
        invalidateQueueQueries(queryClient),
        queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.request(id) }),
      ]);
    },
  });
};

export const useClearVideoRequestQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => videoRequestsRepository.clearRequests(),
    onSuccess: async () => {
      await invalidateQueueQueries(queryClient);
    },
  });
};

export const useVideoRequestSettings = () =>
  useQuery({
    queryKey: VIDEO_REQUESTS_QUERY_KEYS.settings,
    queryFn: () => videoRequestsRepository.getSettings(),
  });

export const useSaveVideoRequestSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: VideoRequestSettingsPatch) => videoRequestsRepository.saveSettings(patch),
    onSuccess: async (settings: VideoRequestSettings) => {
      queryClient.setQueryData(VIDEO_REQUESTS_QUERY_KEYS.settings, settings);
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.settings });
    },
  });
};

export const useReplaceVideoRequestSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: VideoRequestSettings) =>
      videoRequestsRepository.replaceSettings(settings),
    onSuccess: async (settings: VideoRequestSettings) => {
      queryClient.setQueryData(VIDEO_REQUESTS_QUERY_KEYS.settings, settings);
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.settings });
    },
  });
};

export const useVideoRequestRejections = () =>
  useQuery({
    queryKey: VIDEO_REQUESTS_QUERY_KEYS.rejections,
    queryFn: () => videoRequestsRepository.listRejections(),
  });

export const useAppendVideoRequestRejection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRejectedVideoRequestInput) =>
      videoRequestsRepository.appendRejection(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.rejections });
    },
  });
};

export const useClearVideoRequestRejections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => videoRequestsRepository.clearRejections(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.rejections });
    },
  });
};

export const useVideoRequestHistory = () =>
  useQuery({
    queryKey: VIDEO_REQUESTS_QUERY_KEYS.history,
    queryFn: () => videoRequestsRepository.listHistory(),
  });

export const useAppendVideoRequestHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVideoRequestHistoryInput) =>
      videoRequestsRepository.appendHistory(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.history });
    },
  });
};

export const useClearVideoRequestHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => videoRequestsRepository.clearHistory(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.history });
    },
  });
};
