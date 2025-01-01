import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import i18n from '@assets/i18n';

import ENDPOINTS from '../constants/api.constants';
import { GetUserDto, IntegrationValidity } from '../models/user.model';
import { UserInfo } from '../reducers/User/User';
import { AucSettingsDto, SettingsPreset, SettingsPresetLocal, SettingsUpdateRequest } from '../models/settings.model';

export const getUsername = async (): Promise<UserInfo> => {
  const { data } = await axios.get(ENDPOINTS.USER.USERNAME);

  return data;
};

export const updateSettings = async (data: SettingsUpdateRequest): Promise<void> => {
  await axios.put(ENDPOINTS.USER.SETTINGS, data);
};

export const getUserData = async (): Promise<GetUserDto> => {
  const { data } = await axios.get(ENDPOINTS.USER.DATA);

  return data;
};

const getLocalSettingsPresets = (): SettingsPresetLocal[] => {
  return localStorage.getItem('settingsPresets') ? JSON.parse(localStorage.getItem('settingsPresets')!) : [];
};

export const getIntegrationsValidity = async (): Promise<IntegrationValidity> => {
  return (await axios.get(ENDPOINTS.USER.VALIDATE_INTEGRATIONS)).data;
};

export const normalizeLocalSettings = ({
  rewardPresets,
  rewardsPrefix,
  background,
  ...data
}: Partial<AucSettingsDto>): Partial<AucSettingsDto> => {
  return data as any;
};

export const settingsApi = {
  preset: {
    getActive: async (): Promise<string | null> => {
      return localStorage.getItem('activeSettingsPresetId') || null;
    },
    setActive: async (id: string): Promise<void> => {
      localStorage.setItem('activeSettingsPresetId', id);
    },
    setActiveData: async (data: Partial<AucSettingsDto>): Promise<void> => {
      const presets = getLocalSettingsPresets();
      const activePreset = await settingsApi.preset.getActive();
      const updatedPresets = presets.map((preset) =>
        preset.id === activePreset ? { ...preset, data: { ...preset.data, ...normalizeLocalSettings(data) } } : preset,
      );

      await settingsApi.preset.setAll(updatedPresets);
    },
    getAll: async (): Promise<SettingsPreset[]> => {
      return getLocalSettingsPresets();
    },
    setAll: async (data: SettingsPresetLocal[]): Promise<void> => {
      localStorage.setItem('settingsPresets', JSON.stringify(data));
    },
    changeName: async (id: string, name: string): Promise<SettingsPreset[]> => {
      const presets = getLocalSettingsPresets();
      const updatedPresets = presets.map((preset) => (preset.id === id ? { ...preset, name } : preset));

      await settingsApi.preset.setAll(updatedPresets);

      return updatedPresets;
    },
    getData: async (id: string): Promise<AucSettingsDto | undefined> => {
      const presets = getLocalSettingsPresets();

      return presets.find((preset) => preset.id === id)?.data;
    },
    create: async (data: AucSettingsDto): Promise<SettingsPreset> => {
      const presets = getLocalSettingsPresets();
      const newPreset: SettingsPresetLocal = { id: uuidv4(), name: i18n.t('settings.presets.newTitle'), data };

      await settingsApi.preset.setAll([...presets, newPreset]);

      return newPreset;
    },
    delete: async (id: string): Promise<void> => {
      const presets = getLocalSettingsPresets();
      const presetsWithoutDeleted = presets.filter((preset) => preset.id !== id);

      await settingsApi.preset.setAll(presetsWithoutDeleted);
    },
  },
};
