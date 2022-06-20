import axios from 'axios';
import { DeepPartial } from 'react-hook-form';
import ENDPOINTS from '../constants/api.constants';
import { IntegrationFields, SettingFields } from '../reducers/AucSettings/AucSettings';
import { GetUserDto } from '../models/user.model';
import { UserInfo } from '../reducers/User/User';

export const getUsername = async (): Promise<UserInfo> => {
  const { data } = await axios.get(ENDPOINTS.USER.USERNAME);

  return data;
};

export const updateSettings = async (settings: DeepPartial<SettingFields>): Promise<void> => {
  await axios.put(ENDPOINTS.USER.SETTINGS, settings);
};

export const updateIntegration = async (integration: DeepPartial<IntegrationFields>): Promise<void> => {
  await axios.put(ENDPOINTS.USER.INTEGRATION, integration);
};

export const getUserData = async (): Promise<GetUserDto> => {
  const { data } = await axios.get(ENDPOINTS.USER.DATA);

  return data;
};
