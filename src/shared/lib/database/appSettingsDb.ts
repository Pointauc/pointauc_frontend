import Dexie, { type EntityTable } from 'dexie';

import { resolveBackgroundType, BackgroundType } from '@models/settings.model';
import { isBrowser } from '@utils/ssr';

/**
 * Application-wide settings stored in IndexedDB.
 * More fields will be migrated here from local storage over time.
 */
export interface AppSettingsRecord {
  id: string;
  background: string | null;
}

export type AppSettingsUpdate = Partial<Omit<AppSettingsRecord, 'id'>>;

const APP_SETTINGS_ID = 'app';
const LEGACY_SETTINGS_STORAGE_KEY = 'settings';

/**
 * Tracks whether the background field is fully backed by IndexedDB.
 * Until the migration finishes, the background must stay in the legacy
 * localStorage settings, so early settings writes cannot erase the only
 * durable copy before it is transferred to IndexedDB.
 */
let isBackgroundMigrated = false;

/**
 * Tells whether the background has been migrated to IndexedDB and no longer
 * needs to be kept in the legacy localStorage settings.
 */
export const checkIsBackgroundMigrated = (): boolean => isBackgroundMigrated;

class AppSettingsDatabase extends Dexie {
  appSettings!: EntityTable<AppSettingsRecord, 'id'>;

  constructor() {
    super('pointauc-app-settings');
    this.version(1).stores({
      appSettings: 'id',
    });
  }
}

export const appSettingsDb = new AppSettingsDatabase();

const readLegacySettings = (): Record<string, unknown> | null => {
  if (!isBrowser) {
    return null;
  }

  const rawSettings = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
  if (!rawSettings) {
    return null;
  }

  try {
    return JSON.parse(rawSettings) as Record<string, unknown>;
  } catch (err) {
    console.error('Failed to parse legacy settings from localStorage', err);
    return null;
  }
};

/**
 * Removes the background from the legacy localStorage settings.
 * Re-reads the stored value so concurrent settings changes are kept intact.
 * Keeps backgroundType in sync so a migrated background still resolves to custom media.
 */
const clearLegacyBackground = (): void => {
  const legacySettings = readLegacySettings();
  if (!legacySettings || typeof legacySettings.background !== 'string') {
    return;
  }

  const { background, ...settingsWithoutBackground } = legacySettings;
  const migratedSettings = {
    ...settingsWithoutBackground,
    backgroundType: resolveBackgroundType(
      background as string | null | undefined,
      legacySettings.backgroundType as BackgroundType | undefined,
    ),
  };

  localStorage.setItem(LEGACY_SETTINGS_STORAGE_KEY, JSON.stringify(migratedSettings));
};

/**
 * Loads application settings from IndexedDB.
 * On first run migrates the background from legacy localStorage storage.
 * Marks the migration as done only when the background is durably stored in
 * IndexedDB, so a failed run keeps the legacy copy in localStorage for a retry.
 * Returns only the fields that are available, so missing values do not overwrite the state.
 */
export const loadAppSettings = async (): Promise<AppSettingsUpdate> => {
  const storedSettings = await appSettingsDb.appSettings.get(APP_SETTINGS_ID);
  if (storedSettings) {
    isBackgroundMigrated = true;
    return { background: storedSettings.background };
  }

  const legacySettings = readLegacySettings();
  if (!legacySettings || typeof legacySettings.background !== 'string') {
    isBackgroundMigrated = true;
    return {};
  }

  await appSettingsDb.appSettings.put({ id: APP_SETTINGS_ID, background: legacySettings.background });
  clearLegacyBackground();
  isBackgroundMigrated = true;

  return { background: legacySettings.background };
};

/**
 * Merges the given settings into the stored application settings record.
 * Undefined values are ignored so they cannot erase already stored fields.
 * Runs in a transaction so concurrent field updates do not overwrite each other.
 */
export const saveAppSettings = async (settings: AppSettingsUpdate): Promise<void> => {
  const definedSettings = Object.fromEntries(
    Object.entries(settings).filter(([, value]) => value !== undefined),
  ) as AppSettingsUpdate;

  await appSettingsDb.transaction('rw', appSettingsDb.appSettings, async () => {
    const storedSettings = await appSettingsDb.appSettings.get(APP_SETTINGS_ID);

    await appSettingsDb.appSettings.put({
      id: APP_SETTINGS_ID,
      background: null,
      ...storedSettings,
      ...definedSettings,
    });
  });
};
