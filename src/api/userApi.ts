import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';
import { SettingFields } from '../reducers/AucSettings/AucSettings';

export const getUsername = async (): Promise<string> => {
  const { data } = await axios.get(ENDPOINTS.USER.USERNAME);

  return data;
};

export const updateAucSettings = async (settings: SettingFields): Promise<void> => {
  await axios.post(ENDPOINTS.USER.AUC_SETTINGS, settings);
};

export const getAucSettings = async (): Promise<SettingFields> => {
  const { data } = await axios.get(ENDPOINTS.USER.AUC_SETTINGS);

  return data;
};
