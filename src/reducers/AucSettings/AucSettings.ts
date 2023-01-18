import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';
import { getUserData } from '../../api/userApi';
import { setHasDAAuth, setHasTwitchAuth, setUserId, updateUsername } from '../User/User';
import { GetUserDto } from '../../models/user.model';

export interface SettingFields {
  startTime?: number;
  timeStep?: number;
  isAutoincrementActive?: boolean;
  autoincrementTime?: number;
  isBuyoutVisible?: boolean;
  background: string | null;
  purchaseSort?: number;
  marblesAuc?: boolean;
  marbleRate?: number;
  marbleCategory?: number;
  isMaxTimeActive?: boolean;
  maxTime?: number;
  showChances?: boolean;
  newSlotIncrement?: number;
  isNewSlotIncrement?: boolean;
  isTotalVisible?: boolean;
  luckyWheel?: boolean;
}

export interface ViewSettings {
  compact: boolean;
}

export interface RewardSetting {
  cost?: number;
  color?: string;
}

export interface TwitchIntegration {
  isRefundAvailable: boolean;
  dynamicRewards: boolean;
  alwaysAddNew: boolean;
  rewardsPrefix: string;
  rewardPresets: RewardSetting[];
}

export interface DaIntegration {
  pointsRate: number;
  isIncrementActive: boolean;
  incrementTime: number;
}

export interface IntegrationFields {
  twitch: TwitchIntegration;
  da: DaIntegration;
}

interface AucSettingsState {
  view: ViewSettings;
  settings: SettingFields;
  integration: IntegrationFields;
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
    isTotalVisible: true,
    luckyWheel: false,
  },
  integration: {
    twitch: {
      isRefundAvailable: false,
      dynamicRewards: false,
      alwaysAddNew: false,
      rewardsPrefix: 'ставка',
      rewardPresets: [],
    },
    da: {
      pointsRate: 1,
      isIncrementActive: false,
      incrementTime: 30,
    },
  },
};

const mergeCheck = <T>(obj: T, src: T): T => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<Partial<SettingFields>>): void {
      state.settings = mergewith(state.settings, action.payload, mergeCheck);
    },
    setIntegration(state, action: PayloadAction<IntegrationFields>): void {
      state.integration.da = mergewith(state.integration.da, action.payload.da, mergeCheck);
      state.integration.twitch = mergewith(state.integration.twitch, action.payload.twitch, mergeCheck);
    },
    setCompact(state, action: PayloadAction<boolean>): void {
      state.view.compact = action.payload;
    },
    setShowChances(state, action: PayloadAction<boolean>): void {
      state.settings.showChances = action.payload;
    },
  },
});

export const { setAucSettings, setIntegration, setCompact, setShowChances } = aucSettingsSlice.actions;

export const loadUserData = async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<GetUserDto> => {
  const user = await getUserData();
  const { twitchAuth, twitchSettings, aucSettings, daSettings, daAuth } = user;

  if (aucSettings) {
    dispatch(setAucSettings(aucSettings));
  }
  dispatch(setIntegration({ twitch: twitchSettings, da: daSettings }));
  dispatch(updateUsername(twitchAuth?.username || daAuth?.username || ''));
  dispatch(setUserId(twitchAuth?.id as any));
  dispatch(setHasDAAuth(!!daAuth?.isValid));
  dispatch(setHasTwitchAuth(!!twitchAuth?.isValid));

  return user;
};

export default aucSettingsSlice.reducer;
