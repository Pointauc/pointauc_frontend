import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';

import { getUserData, updateSettings } from '@api/userApi.ts';
import { GetUserDto } from '@models/user.model.ts';
import { AucSettingsDto, SettingsForm } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';

import { setUserState } from '../User/User';
import { RootState } from '../index';
import { validateIntegrations } from '../Subscription/Subscription';

export interface ViewSettings {
  compact: boolean;
}

interface AucSettingsState {
  view: ViewSettings;
  settings: AucSettingsDto;
}

export const initialState: AucSettingsState = {
  view: {
    compact: false,
  },
  settings: {
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
    isIncrementActive: false,
    incrementTime: 30,
    rewardPresets: [],
    showUpdates: true,
    primaryColor: COLORS.THEME.PRIMARY,
    backgroundTone: COLORS.THEME.BACKGROUND_TONE,
  },
};

const mergeCheck = <T>(obj: T, src: T): T => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<Partial<AucSettingsDto>>): void {
      state.settings = mergewith(state.settings, action.payload, mergeCheck);
    },
    setCompact(state, action: PayloadAction<boolean>): void {
      state.view.compact = action.payload;
    },
    setShowChances(state, action: PayloadAction<boolean>): void {
      state.settings.showChances = action.payload;
    },
  },
});

export const { setAucSettings, setCompact, setShowChances } = aucSettingsSlice.actions;

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
    dispatch(setAucSettings(activeSettings));
  }
  dispatch(
    setUserState({
      username: twitchAuth?.username ?? daAuth?.username ?? donatePayAuth?.username ?? 'Empty',
      userId: twitchAuth?.id,
      hasDAAuth: !!daAuth?.isValid,
      hasTwitchAuth: !!twitchAuth?.isValid,
      hasDonatPayAuth: !!donatePayAuth?.isValid,
      activeSettingsPresetId,
    }),
  );
  validateIntegrations(dispatch);

  return user;
};

export default aucSettingsSlice.reducer;
