import { TwitchRewardPresetDto } from './user.model';

export interface TwitchIntegration {
  isRefundAvailable: boolean;
  dynamicRewards: boolean;
  alwaysAddNew: boolean;
  rewardsPrefix: string;
}

export interface DonationSettings {
  pointsRate: number;
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
  showChances: boolean;
  newSlotIncrement: number;
  isNewSlotIncrement: boolean;
  isTotalVisible: boolean;
  luckyWheelEnabled: boolean;
  luckyWheelSelectBet: boolean;
  showUpdates: boolean;

  // Appearance
  primaryColor: string;
  backgroundTone: string;
}

export interface SettingsUpdateRequest {
  settings: Partial<AucSettingsDto>;
  id: string;
}

export interface AucSettingsDto extends Settings {
  rewardPresets: TwitchRewardPresetDto[];
}

export type SettingsForm = Partial<AucSettingsDto>;
