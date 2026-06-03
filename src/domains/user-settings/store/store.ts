import { Effect, Store } from '@tanstack/react-store';
import { debounce } from '@tanstack/react-pacer';

import { userControllerSetAucSettings } from '@api/openapi';
import { COLORS } from '@constants/color.constants';
import { DEFAULT_ALLOWED_DOMAINS } from '@domains/links/config/defaultAllowedDomains';
import { BidNameStrategy } from '@enums/bid.enum';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { AucSettingsDto, resolveBackgroundType } from '@models/settings.model';

interface SettingsMissingOnBackend {
  showTotalTime: boolean;
  backgroundOverlayOpacity: number;
  backgroundBlur: number;
  compact: boolean;
  showRules: boolean;
  autoScroll: boolean;
}

export type AucSettingsStore = AucSettingsDto & SettingsMissingOnBackend;

const defaultState: AucSettingsStore = {
  startTime: 10,
  isBuyoutVisible: true,
  timeStep: 60,
  isAutoincrementActive: false,
  autoincrementTime: 30,
  purchaseSort: 0,
  background: null,
  backgroundType: 'default',
  backgroundOverlayOpacity: 0.4,
  backgroundBlur: 0,
  isGeometryBackgroundColorEnabled: true,
  marblesAuc: false,
  marbleRate: 50,
  marbleCategory: 100,
  showChances: false,
  showViewerNames: false,
  maxTime: 15,
  minTime: 2,
  isMinTimeActive: false,
  isMaxTimeActive: false,
  newSlotIncrement: 60,
  isNewSlotIncrement: false,
  isTotalVisible: false,
  luckyWheelEnabled: false,
  luckyWheelSelectBet: true,
  isRefundAvailable: false,
  dynamicRewards: false,
  alwaysAddNew: false,
  rewardsPrefix: 'ставка',
  pointsRate: 1,
  reversePointsRate: false,
  isIncrementActive: false,
  incrementTime: 30,
  rewardPresets: [],
  showUpdates: true,
  insertStrategy: InsertStrategy.Match,
  bidNameStrategy: BidNameStrategy.Message,
  primaryColor: COLORS.THEME.PRIMARY,
  backgroundTone: COLORS.THEME.BACKGROUND_TONE,
  hideAmounts: false,
  isLotLinkParsingEnabled: false,
  allowedDomains: DEFAULT_ALLOWED_DOMAINS,
  ignoreExternalLinkConfirmation: false,
  showTotalTime: false,
  compact: false,
  showRules: false,
  autoScroll: false,
  events: {
    aukus: {
      enabled: false,
    },
  }
};

const settingsFromStorage = localStorage.getItem('userSettings')
  ? JSON.parse(localStorage.getItem('userSettings') as string)
  : {};

const resolveLotLinkParsingSetting = (settings: Record<string, unknown>): boolean => {
  const nextValue = settings.isLotLinkParsingEnabled;
  if (typeof nextValue === 'boolean') {
    return nextValue;
  }

  const legacyValue = settings.isParticipantImdbParsingEnabled;
  return typeof legacyValue === 'boolean' ? legacyValue : defaultState.isLotLinkParsingEnabled;
};

// When data structure was changed we need to migrate settings from the local storage to the new structure
const migratedSettings = {
  showRules: localStorage.getItem('showRules') === 'true',
  backgroundType: resolveBackgroundType(settingsFromStorage.background, settingsFromStorage.backgroundType),
  isLotLinkParsingEnabled: resolveLotLinkParsingSetting(settingsFromStorage),
};

const initialState: AucSettingsStore = {
  ...defaultState,
  ...settingsFromStorage,
  ...migratedSettings,
};

const userSettingsStore = new Store(initialState);

const saveLocally = new Effect({
  fn: () => {
    localStorage.setItem('userSettings', JSON.stringify(userSettingsStore.state));
  },
  deps: [userSettingsStore],
});
saveLocally.mount();

export default userSettingsStore;
