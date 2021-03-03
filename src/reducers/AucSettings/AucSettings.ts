import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';
import { getUserData } from '../../api/userApi';
import { setUsername, setHasDAAuth, setUserId } from '../User/User';

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
  showChances?: boolean;
}

export interface RewardSetting {
  cost?: number;
  color?: string;
}

export interface TwitchIntegration {
  isRefundAvailable: boolean;
  dynamicRewards: boolean;
  rewardsPrefix: string;
  rewards: RewardSetting[];
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
  settings: SettingFields;
  integration: IntegrationFields;
}

export const initialState: AucSettingsState = {
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
  },
  integration: {
    twitch: {
      isRefundAvailable: false,
      dynamicRewards: false,
      rewardsPrefix: 'ставка',
      rewards: [],
    },
    da: {
      pointsRate: 100,
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
    setAucSettings(state, action: PayloadAction<SettingFields>): void {
      state.settings = mergewith(state.settings, action.payload, mergeCheck);
    },
    setIntegration(state, action: PayloadAction<IntegrationFields>): void {
      state.integration.da = mergewith(state.integration.da, action.payload.da, mergeCheck);
      state.integration.twitch = mergewith(state.integration.twitch, action.payload.twitch, mergeCheck);
    },
  },
});

export const { setAucSettings, setIntegration } = aucSettingsSlice.actions;

export const loadUserData = async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<void> => {
  const { username, userId, settings, integration, hasDAAuth } = await getUserData();

  if (settings) {
    dispatch(setAucSettings(settings));
  }
  if (integration) {
    dispatch(setIntegration(integration));
  }
  dispatch(setUsername(username));
  dispatch(setUserId(userId));
  dispatch(setHasDAAuth(hasDAAuth));
};

export default aucSettingsSlice.reducer;
