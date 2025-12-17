import { RulesPreset } from '@pages/auction/Rules/helpers';

import rulesActiveApi from '../api/IndexedDBAdapter';

export const checkIfMigrationEnabled = (): boolean => {
  const STORAGE_KEY = 'rules';
  const savedRules = localStorage.getItem(STORAGE_KEY);
  return savedRules !== null;
};

/**
 * Migrates rules from localStorage to IndexedDB
 * @returns The ID of the first rule (to set as active), or null if no rules were migrated
 */
export async function migrateRulesToIndexedDB(): Promise<string | null> {
  const STORAGE_KEY = 'rules';

  try {
    // Check if rules exist in localStorage
    const savedRules = localStorage.getItem(STORAGE_KEY);
    if (!savedRules) {
      console.log('No rules found in localStorage, skipping migration');
      return null;
    }

    const rules: RulesPreset[] = JSON.parse(savedRules);

    if (rules.length === 0) {
      console.log('No rules to migrate from localStorage');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Check if rules already exist in IndexedDB (migration already done)
    const existingRules = await rulesActiveApi.getAll();
    if (existingRules.length > 0) {
      console.log('Rules already exist in IndexedDB, skipping migration');
      // Clean up localStorage anyway
      localStorage.removeItem(STORAGE_KEY);
      return existingRules[0].id;
    }

    // Migrate each rule to IndexedDB
    let firstRuleId: string | null = null;

    for (const rule of rules) {
      const record = await rulesActiveApi.create({
        name: rule.name,
        data: JSON.stringify(rule.content),
      });

      if (!firstRuleId) {
        firstRuleId = record.id;
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(STORAGE_KEY);

    console.log(`Successfully migrated ${rules.length} rules from localStorage to IndexedDB`);
    return firstRuleId;
  } catch (error) {
    console.error('Rules migration error:', error);
    throw error;
  }
}
