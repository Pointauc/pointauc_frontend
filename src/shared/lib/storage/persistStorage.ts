/**
 * Request persistent storage from the browser.
 * This marks the origin's storage (IndexedDB, LocalStorage, Cache API) as persistent,
 * preventing the browser from automatically clearing/evicting data during storage pressure or idle eviction.
 */
export const requestStoragePersistence = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator?.storage?.persist) {
    return false;
  }

  try {
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      return true;
    }
    const granted = await navigator.storage.persist();
    return granted;
  } catch (err) {
    console.warn('Failed to request persistent storage from browser:', err);
    return false;
  }
};

/**
 * Checks whether the origin's storage is currently marked as persistent.
 */
export const checkIsStoragePersisted = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !navigator?.storage?.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch (err) {
    console.warn('Failed to check persistent storage status:', err);
    return false;
  }
};
