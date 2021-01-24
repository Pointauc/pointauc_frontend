import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';
import { IntegrationFields, SettingFields } from '../reducers/AucSettings/AucSettings';
import { UserData } from '../models/user.model';

export const getUsername = async (): Promise<string> => {
  const { data } = await axios.get(ENDPOINTS.USER.USERNAME);

  return data;
};

export const updateSettings = async (settings: SettingFields): Promise<void> => {
  await axios.post(ENDPOINTS.USER.SETTINGS, settings);
};

export const updateIntegration = async (integration: IntegrationFields): Promise<void> => {
  await axios.post(ENDPOINTS.USER.INTEGRATION, integration);
};

export const getUserData = async (): Promise<UserData> => {
  const { data } = await axios.get(ENDPOINTS.USER.DATA);

  return data;
};
