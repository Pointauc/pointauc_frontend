import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';
import { GetUserDto, IntegrationValidity } from '../models/user.model';
import { UserInfo } from '../reducers/User/User';
import { SettingsUpdateRequest } from '../models/settings.model';

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

export const getIntegrationsValidity = async (): Promise<IntegrationValidity> => {
  return (await axios.get(ENDPOINTS.USER.VALIDATE_INTEGRATIONS)).data;
};
