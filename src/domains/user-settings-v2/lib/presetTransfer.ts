import { v4 as uuidv4 } from 'uuid';

import { settingsApi } from '@api/userApi.ts';
import { SettingsPresetLocal } from '@models/settings.model.ts';
import { loadFile } from '@utils/common.utils.ts';

export interface PresetTransferPayload {
  version: 1;
  exportedAt: string;
  activePresetId: string | null;
  presets: SettingsPresetLocal[];
}

export const INVALID_PRESET_TRANSFER_FILE_ERROR_CODE = 'INVALID_PRESET_TRANSFER_FILE';

const checkIsRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const checkIsPreset = (value: unknown): value is SettingsPresetLocal => {
  return (
    checkIsRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    checkIsRecord(value.data)
  );
};

const checkIsPresetTransferPayload = (value: unknown): value is PresetTransferPayload => {
  return (
    checkIsRecord(value) &&
    value.version === 1 &&
    typeof value.exportedAt === 'string' &&
    (typeof value.activePresetId === 'string' || value.activePresetId === null) &&
    Array.isArray(value.presets) &&
    value.presets.length > 0 &&
    value.presets.every(checkIsPreset)
  );
};

export const buildPresetTransferPayload = async (): Promise<PresetTransferPayload> => {
  const [presets, activePresetId] = await Promise.all([
    settingsApi.preset.getAll() as Promise<SettingsPresetLocal[]>,
    settingsApi.preset.getActive(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    activePresetId,
    presets,
  };
};

export const downloadPresetTransferFile = async (): Promise<void> => {
  const payload = await buildPresetTransferPayload();
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  loadFile(`pointauc-presets-${now}.json`, JSON.stringify(payload, null, 2));
};

export const parsePresetTransferFile = async (file: File): Promise<PresetTransferPayload> => {
  const rawContent = await file.text();
  const parsedContent = JSON.parse(rawContent) as unknown;

  if (!checkIsPresetTransferPayload(parsedContent)) {
    throw new Error(INVALID_PRESET_TRANSFER_FILE_ERROR_CODE);
  }

  return parsedContent;
};

export const applyPresetTransferPayload = async (payload: PresetTransferPayload): Promise<void> => {
  await settingsApi.preset.setAll(payload.presets);

  const activePresetId =
    payload.activePresetId && payload.presets.some((preset) => preset.id === payload.activePresetId)
      ? payload.activePresetId
      : payload.presets[0]?.id ?? null;

  if (activePresetId) {
    await settingsApi.preset.setActive(activePresetId);
  }
};

export const createPresetRecord = (name: string, data: SettingsPresetLocal['data']): SettingsPresetLocal => {
  return {
    id: uuidv4(),
    name,
    data,
  };
};
