import { AucSettingsDto } from './settings.model';

export interface IntegrationDataDto {
  username: string;
  id: string;
  isValid: number;
}

export interface TwitchRewardPresetDto {
  cost: number;
  color: string;
}

export interface IntegrationData {
  twitchAuth: IntegrationDataDto;
  daAuth: IntegrationDataDto;
  donatePayAuth: IntegrationDataDto;
}

export interface GetUserDto extends IntegrationData {
  activeSettings: AucSettingsDto;
  activeSettingsPresetId: string;
}

export type IntegrationValidity = {
  [key in keyof IntegrationData]: boolean;
};

export interface TwitchRewardPresetsRequest {
  presets: TwitchRewardPresetDto[];
  prefix: string;
  settingsId: string;
}
