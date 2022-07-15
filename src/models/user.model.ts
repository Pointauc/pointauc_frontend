import {
  DaIntegration,
  IntegrationFields,
  SettingFields,
  TwitchIntegration,
} from '../reducers/AucSettings/AucSettings';

export interface UserData {
  username: string;
  userId: string;
  hasDAAuth: boolean;
  hasTwitchAuth: boolean;
  settings?: SettingFields;
  integration?: IntegrationFields;
}

export interface IntegrationDataDto {
  username: string;
  id: string;
  isValid: number;
}

export interface TwitchRewardPresetDto {
  cost: number;
  color: string;
}

export interface GetUserDto {
  aucSettings: SettingFields;
  twitchSettings: TwitchIntegration;
  twitchAuth?: IntegrationDataDto;
  daSettings: DaIntegration;
  daAuth?: IntegrationDataDto;
}
