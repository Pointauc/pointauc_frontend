import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { mergeWith } from 'es-toolkit';

import { getUserData, updateSettings } from '@api/userApi.ts';
import { GetUserDto } from '@models/user.model.ts';
import { AucSettingsDto, SettingsForm } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { aukus } from '@components/Event/events.ts';
import { BidNameStrategy } from '@enums/bid.enum';

import { setUserState } from '../User/User';
import { RootState } from '../index';
import { validateIntegrations } from '../Subscription/Subscription';

export interface ViewSettings {
  compact: boolean;
  showRules: boolean;
  autoScroll: boolean;
}

interface EventsSettings {
  aukus: { enabled: boolean };
}

interface SettingsMissingOnBackend {
  showTotalTime: boolean;
  backgroundOverlayOpacity: number;
  backgroundBlur: number;
}

export interface AucSettingsState {
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
    autoScroll: false,
  },
  settings: localStorage.getItem('settings')
    ? { ...defaultSettings, ...JSON.parse(localStorage.getItem('settings') as string) }
    : defaultSettings,
};

const mergeCheck = <T>(obj: T, src: T): T => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<Partial<AucSettingsDto>>): void {
      const mergedSettings = mergeWith(state.settings, action.payload, mergeCheck);
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
    setAutoScroll(state, action: PayloadAction<boolean>): void {
      state.view.autoScroll = action.payload;
    },
  },
});

export const { setAucSettings, setCompact, setShowRules, setShowChances, setAutoScroll } = aucSettingsSlice.actions;

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
  const { twitchAuth, activeSettings, daAuth, tourniquetAuth, donatePayAuth, activeSettingsPresetId, ihaqAuth } = user;

  if (activeSettings) {
    const { startTime, timeStep, ...settings } = activeSettings;
    dispatch(
      setAucSettings({
        ...settings,
        primaryColor:
          localStorage.getItem('isColorResetDone') !== 'true' ? COLORS.THEME.PRIMARY : settings.primaryColor,
      }),
    );
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
        tourniquet: tourniquetAuth,
        ihaq: ihaqAuth,
      },
    }),
  );

  if (localStorage.getItem('isColorResetDone') !== 'true') {
    dispatch(saveSettings({ primaryColor: COLORS.THEME.PRIMARY }));
    localStorage.setItem('isColorResetDone', 'true');
  }
  // if (localStorage.getItem('minTime')) {
  //   dispatch(saveSettings({ minTime: minTime ? Number(minTime) : activeSettings.minTime }));
  //   localStorage.removeItem('isMinTimeActive');
  //   localStorage.removeItem('minTime');
  // }
  dispatch(validateIntegrations);

  return user;
};

export default aucSettingsSlice.reducer;
