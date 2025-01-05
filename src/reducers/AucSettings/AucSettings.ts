import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';

import { getUserData, updateSettings } from '@api/userApi.ts';
import { GetUserDto } from '@models/user.model.ts';
import { AucSettingsDto, SettingsForm } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';
import { InsertStrategy } from '@enums/settings.enum.ts';
import { aukus } from '@components/Event/events.ts';

import { setUserState } from '../User/User';
import { RootState } from '../index';
import { validateIntegrations } from '../Subscription/Subscription';

export interface ViewSettings {
  compact: boolean;
  showRules: boolean;
}

interface EventsSettings {
  aukus: { enabled: boolean };
}

interface SettingsMissingOnBackend {
  showTotalTime: boolean;
}

interface AucSettingsState {
  view: ViewSettings;
  settings: AucSettingsDto & { events: EventsSettings } & SettingsMissingOnBackend;
}
const showRules = localStorage.getItem('showRules');

const defaultSettings: AucSettingsState['settings'] = {
  startTime: 10,
  isBuyoutVisible: true,
  timeStep: 60,
  isAutoincrementActive: false,
  autoincrementTime: 30,
  purchaseSort: 0,
  background: null,
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
  primaryColor: COLORS.THEME.PRIMARY,
  backgroundTone: COLORS.THEME.BACKGROUND_TONE,
  hideAmounts: false,
  showTotalTime: false,
  events: {
    aukus: {
      enabled: aukus.enabled.get(),
    },
  },
};

export const initialState: AucSettingsState = {
  view: {
    compact: false,
    showRules: showRules === 'true',
  },
  settings: localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings') as string) : defaultSettings,
};

const mergeCheck = <T>(obj: T, src: T): T => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<Partial<AucSettingsDto>>): void {
      const mergedSettings = mergewith(state.settings, action.payload, mergeCheck);
      localStorage.setItem('settings', JSON.stringify(mergedSettings));
      state.settings = mergedSettings;
    },
    setCompact(state, action: PayloadAction<boolean>): void {
      state.view.compact = action.payload;
    },
    setShowChances(state, action: PayloadAction<boolean>): void {
      state.settings.showChances = action.payload;
    },
    setShowRules(state, action: PayloadAction<boolean>): void {
      state.view.showRules = action.payload;
      localStorage.setItem('showRules', String(action.payload));
    },
  },
});

export const { setAucSettings, setCompact, setShowRules, setShowChances } = aucSettingsSlice.actions;

export const saveSettings =
  (settings: SettingsForm) =>
  async (dispatch: ThunkDispatch<RootState, {}, Action>, getState: () => RootState): Promise<void> => {
    dispatch(setAucSettings(settings));
    const {
      user: { activeSettingsPresetId, username },
    } = getState();

    if (username) {
      await updateSettings({ settings, id: activeSettingsPresetId });
    }
  };

export const loadUserData = async (dispatch: ThunkDispatch<RootState, {}, Action>): Promise<GetUserDto> => {
  const user = await getUserData();
  const { twitchAuth, activeSettings, daAuth, donatePayAuth, activeSettingsPresetId } = user;

  if (activeSettings) {
    const { startTime, timeStep, ...settings } = activeSettings;
    dispatch(setAucSettings(settings));
  }
  dispatch(
    setUserState({
      username: twitchAuth?.username ?? daAuth?.username ?? donatePayAuth?.username ?? 'Empty',
      userId: twitchAuth?.id,
      activeSettingsPresetId,
      authData: {
        donatePay: donatePayAuth,
        da: daAuth,
        twitch: twitchAuth,
      },
    }),
  );
  // if (localStorage.getItem('minTime')) {
  //   dispatch(saveSettings({ minTime: minTime ? Number(minTime) : activeSettings.minTime }));
  //   localStorage.removeItem('isMinTimeActive');
  //   localStorage.removeItem('minTime');
  // }
  dispatch(validateIntegrations);

  return user;
};

export default aucSettingsSlice.reducer;
