import Dexie, { type EntityTable } from 'dexie';

/**
 * Wheel settings record stored in IndexedDB
 */
export interface WheelSettingsRecord {
  id: string;
  data: string; // JSON string
}

export interface WheelSettingsParsedRecord {
  id: string;
  data: Wheel.Settings;
}

/**
 * Dexie database instance for user settings management
 */
class UserSettingsDatabase extends Dexie {
  wheelSettings!: EntityTable<WheelSettingsRecord, 'id'>;

  constructor() {
    super('pointauc-user-settings');
    this.version(1).stores({
      wheelSettings: 'id',
    });
  }
}

// Export singleton instance
export const userSettingsDb = new UserSettingsDatabase();
