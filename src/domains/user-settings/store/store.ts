import { Effect, Store } from '@tanstack/react-store';
import { debounce } from '@tanstack/react-pacer';

import { userControllerSetAucSettings } from '@api/openapi';
import { COLORS } from '@constants/color.constants';
import { BidNameStrategy } from '@enums/bid.enum';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { AucSettingsDto } from '@models/settings.model';
import { AucSettingsState as LegacyAucSettingsState } from '@reducers/AucSettings/AucSettings';

interface SettingsMissingOnBackend {
  showTotalTime: boolean;
  backgroundOverlayOpacity: number;
  backgroundBlur: number;
  compact: boolean;
  showRules: boolean;
  autoScroll: boolean;
}

type AucSettingsStore = AucSettingsDto & SettingsMissingOnBackend;

const defaultState: AucSettingsStore = {
  startTime: 10,
  isBuyoutVisible: true,
  timeStep: 60,
  isAutoincrementActive: false,
  autoincrementTime: 30,
  purchaseSort: 0,
  background: null,
  backgroundOverlayOpacity: 0.4,
  backgroundBlur: 0,
  marblesAuc: false,
  marbleRate: 50,
  marbleCategory: 100,
  showChances: false,
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
  showTotalTime: false,
  compact: false,
  showRules: false,
  autoScroll: false,
  events: {
    aukus: {
      enabled: false,
    },
  },
};

const settingsFromStorage = localStorage.getItem('userSettings')
  ? JSON.parse(localStorage.getItem('userSettings') as string)
  : {};

// When data structure was changed we need to migrate settings from the local storage to the new structure
const migratedSettings = {
  // compact: settingsFromStorage.view.compact,
  showRules: localStorage.getItem('showRules') === 'true',
  // autoScroll: settingsFromStorage.view.autoScroll,
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

let pendingSettings: Partial<AucSettingsStore> = {};

const uploadPendingSettingsDebounced = debounce(
  () => {
    userControllerSetAucSettings({ body: pendingSettings as any });
    pendingSettings = {};
  },
  {
    wait: 1000,
    trailing: true,
    leading: false,
  },
);

const updateSettings = (updatedSettings: Partial<AucSettingsStore>) => {
  userSettingsStore.setState((prev) => ({
    ...prev,
    ...updatedSettings,
  }));

  pendingSettings = {
    ...pendingSettings,
    ...updatedSettings,
  };

  uploadPendingSettingsDebounced();
};

export default userSettingsStore;
