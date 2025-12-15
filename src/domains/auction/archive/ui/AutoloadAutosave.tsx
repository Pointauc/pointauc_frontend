import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@reducers/index';
import { setSlots } from '@reducers/Slots/Slots';
import { LocalStorage } from '@constants/common.constants';
import { SaveInfo } from '@models/save.model';
import { Slot } from '@models/slot.model';

import archiveApi from '../api/IndexedDBAdapter';
import { archivedLotsToSlots, slotsToArchivedLots } from '../lib/converters';
import { ArchiveData } from '../model/types';

/**
 * Migrates old LocalStorage saves to new IndexedDB archive system
 */
async function migrateOldSavesToIndexedDB(): Promise<void> {
  try {
    const rawConfig = localStorage.getItem(LocalStorage.SaveConfig);

    // No old saves to migrate
    if (!rawConfig) {
      console.log('No old saves found to migrate');
      return;
    }

    const savesConfig: SaveInfo[] = JSON.parse(rawConfig);

    if (savesConfig.length === 0) {
      console.log('No old saves to migrate');
      // Clean up empty config
      localStorage.removeItem(LocalStorage.SaveConfig);
      return;
    }

    console.log(`Starting migration of ${savesConfig.length} old save(s)...`);

    // Migrate each save to IndexedDB
    for (const saveInfo of savesConfig) {
      try {
        // Retrieve slots from old storage location
        const slotsData = localStorage.getItem(saveInfo.slotsLocation);

        if (!slotsData) {
          console.warn(`No data found for save: ${saveInfo.name}`);
          continue;
        }

        const slots: Slot[] = JSON.parse(slotsData);
        const archivedLots = slotsToArchivedLots(slots);

        // Create archive record in IndexedDB
        const archiveData: ArchiveData = { lots: archivedLots };

        // Check if this is an old autosave (Russian name "Автосохранение")
        if (saveInfo.name === 'Автосохранение') {
          // Override the current autosave in IndexedDB
          await archiveApi.upsertAutosave(archiveData);
          console.log(`Migrated autosave: ${saveInfo.name} (${slots.length} lots)`);
        } else {
          // Create a regular archive record
          await archiveApi.create({
            name: saveInfo.name,
            data: JSON.stringify(archiveData),
            isAutosave: false,
          });
          console.log(`Migrated save: ${saveInfo.name} (${slots.length} lots)`);
        }

        // Remove old LocalStorage entry
        localStorage.removeItem(saveInfo.slotsLocation);
      } catch (err) {
        console.error(`Failed to migrate save: ${saveInfo.name}`, err);
      }
    }

    // Remove old config after migration
    localStorage.removeItem(LocalStorage.SaveConfig);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Failed to migrate old saves:', err);
  }
}

/**
 * Component that auto-loads autosave on app initialization
 * if there are no current slots (or only one empty slot)
 */
function AutoloadAutosave() {
  const dispatch = useDispatch();
  const slots = useSelector((state: RootState) => state.slots.slots);
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    // Run migration first, then load autosave
    const initializeArchive = async () => {
      // Step 1: Migrate old saves
      await migrateOldSavesToIndexedDB();

      // Step 2: Only auto-load if there are no lots or just one empty lot
      if (slots.length <= 1) {
        try {
          const autosave = await archiveApi.getAutosave();
          if (autosave) {
            const data: ArchiveData = JSON.parse(autosave.data);
            if (data.lots.length > 0) {
              const loadedSlots = archivedLotsToSlots(data.lots);
              dispatch(setSlots(loadedSlots));
              console.log('Autosave loaded on startup');
            }
          }
        } catch (err) {
          console.error('Failed to load autosave on startup:', err);
        }
      }
    };

    initializeArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run only once on mount

  return null;
}

export default AutoloadAutosave;
