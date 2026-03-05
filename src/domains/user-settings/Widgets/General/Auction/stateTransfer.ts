import { loadFile } from '@utils/common.utils';
import { store } from '@store';
import archiveApi from '@domains/auction/archive/api/IndexedDBAdapter';
import { wheelSettingsStore } from '@domains/winner-selection/wheel-of-random/lib/indexedDbSettingsStore';
import { setAucSettings } from '@reducers/AucSettings/AucSettings';
import { setHistory, setPurchases } from '@reducers/Purchases/Purchases';
import { setSlots } from '@reducers/Slots/Slots';
import { queryClient } from '@shared/lib/react-query/client.ts';
import { WHEEL_SETTINGS_QUERY_KEY } from '@domains/winner-selection/wheel-of-random/lib/hooks/useWheelSettings';
import { QUERY_KEYS } from '@domains/auction/archive/model/constants';

import type { ArchiveRecord } from '@domains/auction/archive/model/types';
import type { Purchase } from '@reducers/Purchases/Purchases';
import type { Slot } from '@models/slot.model';
import type { AucSettingsState } from '@reducers/AucSettings/AucSettings';

export interface StateTransferPayload {
  version: 1;
  exportedAt: string;
  auctionTable: Slot[];
  pendingPurchases: Purchase[];
  archive: ArchiveRecord[];
  appSettings: AucSettingsState['settings'];
  wheelSettings: Wheel.Settings | null;
}

export const INVALID_TRANSFER_FILE_ERROR_CODE = 'INVALID_STATE_TRANSFER_FILE';

const checkIsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const checkIsTransferPayload = (value: unknown): value is StateTransferPayload => {
  if (!checkIsRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    Array.isArray(value.auctionTable) &&
    Array.isArray(value.pendingPurchases) &&
    Array.isArray(value.archive) &&
    checkIsRecord(value.appSettings) &&
    (checkIsRecord(value.wheelSettings) || value.wheelSettings === null)
  );
};

export const buildStateTransferPayload = async (): Promise<StateTransferPayload> => {
  const state = store.getState();
  const [archiveRecords, wheelSettingsRecord] = await Promise.all([archiveApi.getAll(), wheelSettingsStore.get()]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    auctionTable: state.slots.slots,
    pendingPurchases: state.purchases.purchases,
    archive: archiveRecords,
    appSettings: state.aucSettings.settings,
    wheelSettings: wheelSettingsRecord?.data ?? null,
  };
};

export const downloadStateTransferFile = async (): Promise<void> => {
  const payload = await buildStateTransferPayload();
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  loadFile(`pointauc-state-transfer-${now}.json`, JSON.stringify(payload, null, 2));
};

export const parseTransferFile = async (file: File): Promise<StateTransferPayload> => {
  const rawContent = await file.text();
  const parsedContent = JSON.parse(rawContent) as unknown;

  if (!checkIsTransferPayload(parsedContent)) {
    throw new Error(INVALID_TRANSFER_FILE_ERROR_CODE);
  }

  return parsedContent;
};

export const applyStateTransfer = async (payload: StateTransferPayload): Promise<void> => {
  store.dispatch(setSlots(payload.auctionTable));
  store.dispatch(setPurchases(payload.pendingPurchases));
  store.dispatch(setHistory([]));
  store.dispatch(setAucSettings(payload.appSettings));

  const existingArchiveRecords = await archiveApi.getAll();
  const mergedArchiveById = new Map(existingArchiveRecords.map((record) => [record.id, record]));
  payload.archive.forEach((record) => {
    mergedArchiveById.set(record.id, record);
  });
  await archiveApi.replaceAll(Array.from(mergedArchiveById.values()));
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.archives });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.autosave });

  if (payload.wheelSettings) {
    await wheelSettingsStore.save({ data: payload.wheelSettings });
    queryClient.invalidateQueries({ queryKey: WHEEL_SETTINGS_QUERY_KEY });
  }
};
