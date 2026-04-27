import { InsertStrategy } from '@enums/insertStrategy.enum';
import { BidNameStrategy } from '@enums/bid.enum';

import { TwitchRewardPresetDto } from './user.model';

export type BackgroundType = 'customMedia' | 'default' | 'geometry';

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
  backgroundType: BackgroundType;
  backgroundOverlayOpacity: number;
  backgroundBlur: number;
  isGeometryBackgroundColorEnabled: boolean;
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
  bidNameStrategy: BidNameStrategy;
  hideAmounts: boolean;
  allowedDomains: string[];
  ignoreExternalLinkConfirmation: boolean;

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

export const resolveBackgroundType = (background?: string | null, backgroundType?: BackgroundType): BackgroundType => {
  if (background != null) {
    return 'customMedia';
  }
  return backgroundType ?? 'default';
};
