import dayjs from 'dayjs';
import { SaveInfo } from '../models/save.model';
import { LocalStorage } from '../constants/common.constants';
import { Slot } from '../models/slot.model';
import { FORMAT } from '../constants/format.constants';

class SaveLoadService {
  static getSavesConfig = (): SaveInfo[] => {
    const rawConfig = localStorage.getItem(LocalStorage.SaveConfig);

    if (!rawConfig) {
      localStorage.setItem(LocalStorage.SaveConfig, JSON.stringify([]));
    }

    return rawConfig ? JSON.parse(rawConfig) : [];
  };

  static getSlots = (name: string): Slot[] => {
    const config = SaveLoadService.getSavesConfig();
    const configIndex = config.findIndex(({ name: infoName }) => infoName === name);

    const slots = localStorage.getItem(config[configIndex].slotsLocation);

    return slots ? JSON.parse(slots) : [];
  };

  static rename = (previousName: string, nextName: string): SaveInfo[] => {
    const config = SaveLoadService.getSavesConfig();
    const configIndex = config.findIndex(({ name: infoName }) => infoName === previousName);
    const saveInfo: SaveInfo = { ...config[configIndex], name: nextName };

    config.splice(configIndex, 1, saveInfo);
    localStorage.setItem(LocalStorage.SaveConfig, JSON.stringify(config));

    return config;
  };

  static rewrite = (slots: Slot[], name: string): SaveInfo[] => {
    const config = SaveLoadService.getSavesConfig();
    const configIndex = config.findIndex(({ name: infoName }) => infoName === name);

    if (configIndex < 0) {
      return SaveLoadService.newSave(slots, name);
    }

    const saveInfo: SaveInfo = {
      ...config[configIndex],
      timestamp: new Date().toISOString(),
      length: slots.length.toString(),
    };

    config.splice(configIndex, 1, saveInfo);

    localStorage.setItem(saveInfo.slotsLocation, JSON.stringify(slots));
    localStorage.setItem(LocalStorage.SaveConfig, JSON.stringify(config));

    return config;
  };

  static delete = (name: string): SaveInfo[] => {
    const config = SaveLoadService.getSavesConfig();
    const configIndex = config.findIndex(({ name: infoName }) => infoName === name);

    const deletedSave = config.splice(configIndex, 1)[0];

    localStorage.removeItem(deletedSave.slotsLocation);
    localStorage.setItem(LocalStorage.SaveConfig, JSON.stringify(config));

    return config;
  };

  static newSave = (slots: Slot[], name?: string): SaveInfo[] => {
    const saveInfo: SaveInfo = {
      timestamp: new Date().toISOString(),
      name: name || `Сохранение ${dayjs().format(FORMAT.DATE.dateTime)}`,
      length: slots.length.toString(),
      slotsLocation: Math.random().toString(),
    };
    const config = [...SaveLoadService.getSavesConfig(), saveInfo];

    localStorage.setItem(saveInfo.slotsLocation, JSON.stringify(slots));
    localStorage.setItem(LocalStorage.SaveConfig, JSON.stringify(config));

    return config;
  };
}

export default SaveLoadService;
