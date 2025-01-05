import { InsertStrategy } from '@enums/settings.enum.ts';

import { TwitchRewardPresetDto } from './user.model';

export interface SettingsPreset {
  name: string;
  id: string;
}

export interface SettingsPresetLocal extends SettingsPreset {
  data: AucSettingsDto;
}

export interface TwitchIntegration {
  isRefundAvailable: boolean;
  dynamicRewards: boolean;
  alwaysAddNew: boolean;
  rewardsPrefix: string;
}

export interface DonationSettings {
  pointsRate: number;
  reversePointsRate: boolean;
  isIncrementActive: boolean;
  incrementTime: number;
}

export interface Settings extends TwitchIntegration, DonationSettings {
  startTime: number;
  timeStep: number;
  isAutoincrementActive: boolean;
  autoincrementTime: number;
  isBuyoutVisible: boolean;
  background: string | null;
  purchaseSort: number;
  marblesAuc: boolean;
  marbleRate: number;
  marbleCategory: number;
  isMaxTimeActive: boolean;
  maxTime: number;
  isMinTimeActive: boolean;
  minTime: number;
  showChances: boolean;
  newSlotIncrement: number;
  isNewSlotIncrement: boolean;
  isTotalVisible: boolean;
  luckyWheelEnabled: boolean;
  luckyWheelSelectBet: boolean;
  showUpdates: boolean;
  insertStrategy: InsertStrategy;
  hideAmounts: boolean;

  // Appearance
  primaryColor: string;
  backgroundTone: string;

  events: { aukus: { enabled: boolean } };
}

export interface SettingsUpdateRequest {
  settings: Partial<AucSettingsDto>;
  id: string;
}

export interface AucSettingsDto extends Settings {
  rewardPresets: TwitchRewardPresetDto[];
}

export type SettingsForm = Partial<AucSettingsDto>;
