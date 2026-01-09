import { userSettingsDb, WheelSettingsParsedRecord, WheelSettingsRecord } from '@shared/lib/database/userSettingsDb';

export interface WheelSettingsSavedRecord {
  id?: string;
  data: Wheel.Settings;
}

/**
 * API for managing wheel settings in IndexedDB
 */
class WheelSettingsStore {
  /**
   * Retrieves the first available wheel settings from IndexedDB
   */
  async get(): Promise<WheelSettingsParsedRecord | null> {
    const records = await userSettingsDb.wheelSettings.toArray();

    if (records.length === 0) {
      return null;
    }

    // Get the first available setting
    const firstRecord = records[0];

    try {
      return { id: firstRecord.id, data: JSON.parse(firstRecord.data) as Wheel.Settings };
    } catch (err) {
      console.error('Failed to parse wheel settings:', err);
      return null;
    }
  }

  async getId(): Promise<string> {
    const records = await userSettingsDb.wheelSettings.toArray();
    return records.length > 0 ? records[0].id : crypto.randomUUID();
  }

  /**
   * Saves wheel settings to IndexedDB
   * Updates the record if it exists, otherwise creates a new one
   */
  async save(settings: WheelSettingsSavedRecord): Promise<void> {
    const id = settings.id ?? (await this.getId());
    await userSettingsDb.wheelSettings.put({ id, data: JSON.stringify(settings.data) });
  }

  /**
   * Deletes all wheel settings from IndexedDB
   */
  async delete(): Promise<void> {
    await userSettingsDb.wheelSettings.clear();
  }
}

// Export singleton instance
export const wheelSettingsStore = new WheelSettingsStore();
