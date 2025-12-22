import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { WheelSettingsParsedRecord } from '@shared/lib/database/userSettingsDb';

import { WheelSettingsSavedRecord, wheelSettingsStore } from '../indexedDbSettingsStore';

const WHEEL_SETTINGS_QUERY_KEY = ['wheelSettings'];
const LOCALSTORAGE_KEY = 'wheelSettings';

/**
 * Migrates wheel settings from localStorage to IndexedDB
 */
async function migrateFromLocalStorage(): Promise<Wheel.Settings | null> {
  const localStorageData = localStorage.getItem(LOCALSTORAGE_KEY);

  if (!localStorageData) {
    return null;
  }

  try {
    const settings = JSON.parse(localStorageData) as Wheel.Settings;

    // Save to IndexedDB
    await wheelSettingsStore.save({ data: settings });

    // Optionally remove old localStorage data
    localStorage.removeItem(LOCALSTORAGE_KEY);

    console.log('Successfully migrated wheel settings from localStorage to IndexedDB');

    return settings;
  } catch (err) {
    console.error('Failed to migrate wheel settings from localStorage:', err);
    return null;
  }
}

/**
 * Hook to fetch wheel settings from IndexedDB
 * Automatically migrates from localStorage on first load
 */
export function useWheelSettings() {
  return useQuery<WheelSettingsParsedRecord | null>({
    queryKey: WHEEL_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      // First, attempt migration from localStorage
      await migrateFromLocalStorage();

      // Then fetch from IndexedDB (which now includes migrated data if any)
      return wheelSettingsStore.get();
    },
    staleTime: Infinity, // Settings don't change unless we update them
  });
}

/**
 * Hook to save wheel settings to IndexedDB
 */
export function useSaveWheelSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: WheelSettingsSavedRecord) => {
      await wheelSettingsStore.save(settings);
    },
    onSuccess: (_, settings) => {
      // Update the cache with the new settings
      queryClient.setQueryData(WHEEL_SETTINGS_QUERY_KEY, settings);
    },
  });
}
