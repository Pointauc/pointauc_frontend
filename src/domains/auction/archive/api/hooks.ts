import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { setSlots } from '@reducers/Slots/Slots';
import { loadFile } from '@utils/common.utils';

import { archivedLotsToSlots } from '../lib/converters';
import { QUERY_KEYS } from '../model/constants';
import { ArchiveData, ArchiveRecord } from '../model/types';

import archiveApi from './IndexedDBAdapter';

/**
 * Query hook to fetch all archives
 */
export function useArchives() {
  return useQuery({
    queryKey: QUERY_KEYS.archives,
    queryFn: () => archiveApi.getAll(),
    staleTime: 0,
    gcTime: 0,
  });
}

/**
 * Query hook to fetch a single archive by ID
 */
export function useArchive(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.archive(id),
    queryFn: () => archiveApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Query hook to fetch autosave
 */
export function useAutosave() {
  return useQuery({
    queryKey: QUERY_KEYS.autosave,
    queryFn: () => archiveApi.getAutosave(),
  });
}

/**
 * Mutation hook to create a new archive
 */
export function useCreateArchive() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: ArchiveData }) =>
      archiveApi.create({
        name,
        data: JSON.stringify(data),
        isAutosave: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
      notifications.show({
        title: t('archive.notifications.created'),
        message: '',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: t('archive.notifications.error.create'),
        message: error.message,
        color: 'red',
      });
    },
  });
}

/**
 * Mutation hook to update/rename an archive (no notifications for rename)
 */
export function useUpdateArchive() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, name, data }: { id: string; name?: string; data?: ArchiveData }) => {
      const updates: Partial<ArchiveRecord> = {};
      if (name !== undefined) updates.name = name;
      if (data !== undefined) updates.data = JSON.stringify(data);
      return archiveApi.update(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
      // Only show notification for data overwrite, not for rename
      if (variables.data !== undefined) {
        notifications.show({
          title: t('archive.notifications.overwritten'),
          message: '',
          color: 'green',
        });
      }
    },
    onError: (error: Error, variables) => {
      notifications.show({
        title:
          variables.data !== undefined
            ? t('archive.notifications.error.overwrite')
            : t('archive.notifications.error.rename'),
        message: error.message,
        color: 'red',
      });
    },
  });
}

/**
 * Mutation hook to delete an archive
 */
export function useDeleteArchive() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => archiveApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
      notifications.show({
        title: t('archive.notifications.deleted'),
        message: '',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: t('archive.notifications.error.delete'),
        message: error.message,
        color: 'red',
      });
    },
  });
}

/**
 * Mutation hook to load an archive into Redux store
 */
export function useLoadArchive() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const archive = await archiveApi.getById(id);
      if (!archive) {
        throw new Error('Archive not found');
      }
      return archive;
    },
    onSuccess: (archive) => {
      const data: ArchiveData = JSON.parse(archive.data);
      const slots = archivedLotsToSlots(data.lots);
      dispatch(setSlots(slots));
      notifications.show({
        title: t('archive.notifications.loaded'),
        message: '',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: t('archive.notifications.error.load'),
        message: error.message,
        color: 'red',
      });
    },
  });
}

/**
 * Mutation hook to save autosave
 */
export function useSaveAutosave() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ArchiveData) => archiveApi.upsertAutosave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.autosave });
    },
    onError: (error: Error) => {
      console.error('Autosave failed:', error);
    },
  });
}

/**
 * Hook to export an archive as JSON file
 */
export function useExportArchive() {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const archive = await archiveApi.getById(id);
      if (!archive) {
        throw new Error('Archive not found');
      }
      return archive;
    },
    onSuccess: (archive) => {
      loadFile(`pointauc_${archive.name}.json`, archive.data);

      notifications.show({
        title: t('archive.notifications.exported'),
        message: '',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: t('archive.notifications.error.export'),
        message: error.message,
        color: 'red',
      });
    },
  });
}

interface ImportArchiveProps {
  data: ArchiveData;
  name: string;
}

export function useImportArchive() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async ({ data, name }: ImportArchiveProps) => {
      // Create new archive with imported data
      return archiveApi.create({
        name,
        data: JSON.stringify(data),
        isAutosave: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
      notifications.show({
        title: t('archive.notifications.imported'),
        message: '',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: t('archive.notifications.error.import'),
        message: error.message || t('archive.notifications.error.invalidFile'),
        color: 'red',
      });
    },
  });
}
