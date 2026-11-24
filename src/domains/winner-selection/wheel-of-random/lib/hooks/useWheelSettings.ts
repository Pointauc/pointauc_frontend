import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { WheelSettingsParsedRecord } from '@shared/lib/database/userSettingsDb';

import { WheelSettingsSavedRecord, wheelSettingsStore } from '../indexedDbSettingsStore';

export const WHEEL_SETTINGS_QUERY_KEY = ['wheelSettings'];
const LOCALSTORAGE_KEY = 'wheelSettings';
const LEGACY_SIGNED_RANDOMNESS_SOURCE = 'random-org-signed';

/**
 * Migrates wheel settings from localStorage to IndexedDB
 */
async function migrateFromLocalStorage(): Promise<Wheel.Settings | null> {
  const localStorageData = localStorage.getItem(LOCALSTORAGE_KEY);

  if (!localStorageData) {
    console.log('No wheel settings found in localStorage');
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
    console.error('Failed to migrate wheel settings from localStorage to IndexedDB:', err);
    return null;
  }
}

/**
 * Migrates the removed 'random-org-signed' randomness source to the
 * viewerVerifiableSpin checkbox, preserving the user's choice.
 */
async function migrateLegacyRandomnessSource(
  settings: WheelSettingsParsedRecord,
): Promise<WheelSettingsParsedRecord> {
  // Older saved settings may still reference the removed 'random-org-signed' source
  if ((settings.data.randomnessSource as string) !== LEGACY_SIGNED_RANDOMNESS_SOURCE) {
    return settings;
  }

  const data: Wheel.Settings = {
    ...settings.data,
    randomnessSource: 'local-basic',
    viewerVerifiableSpin: true,
  };

  await wheelSettingsStore.save({ id: settings.id, data });

  return { ...settings, data };
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
      const settings = await wheelSettingsStore.get();

      return settings ? migrateLegacyRandomnessSource(settings) : settings;
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
