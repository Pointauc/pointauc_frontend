import { IndexedDBLocalState } from '@features/localState/indexedDB';

import { Overlay } from '../types/overlay.types';

const storage = new IndexedDBLocalState<Overlay>({
  tableName: 'overlays',
  primaryKey: 'id',
});

storage.init();

export const overlayApi = {
  findAll: async () => {
    return storage.findAll();
  },
  findById: async (id: string) => {
    return storage.findById(id);
  },
  create: async (overlay: Overlay) => {
    return storage.save(overlay);
  },
  update: async (overlay: Overlay) => {
    return storage.update(overlay);
  },
  delete: async (id: string) => {
    return storage.deleteById(id);
  },
};
