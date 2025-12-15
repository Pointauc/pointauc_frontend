import { debounce } from '@tanstack/react-pacer';

import { userControllerSetAucSettings } from '@api/openapi';
import userSettingsStore, { AucSettingsStore } from '@domains/user-settings/store/store';
import { SettingsUpdateRequest } from '@models/settings.model';

import { store } from '../../../main';

let pendingSettings: Partial<AucSettingsStore> = {};

const uploadPendingSettingsDebounced = debounce(
  () => {
    const { activeSettingsPresetId } = store.getState().user;
    const body: SettingsUpdateRequest = {
      settings: pendingSettings,
      id: activeSettingsPresetId,
    };
    userControllerSetAucSettings({ body: body as any });
    pendingSettings = {};
  },
  {
    wait: 1000,
    trailing: true,
    leading: false,
  },
);

export const updateActiveSettings = (updatedSettings: Partial<AucSettingsStore>) => {
  userSettingsStore.setState((prev) => ({
    ...prev,
    ...updatedSettings,
  }));

  pendingSettings = {
    ...pendingSettings,
    ...updatedSettings,
  };

  uploadPendingSettingsDebounced();
};
