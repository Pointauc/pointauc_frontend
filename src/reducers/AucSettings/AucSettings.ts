import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import mergewith from 'lodash.mergewith';
import { getUserData } from '../../api/userApi';
import { setUsername, setHasDAAuth } from '../User/User';

export interface SettingFields {
  startTime?: number;
  timeStep?: number;
  isAutoincrementActive?: boolean;
  autoincrementTime?: number;
  isBuyoutVisible?: boolean;
  background?: string;
  purchaseSort?: number;
}

export interface RewardSetting {
  cost?: number;
  color?: string;
}

export interface IntegrationFields {
  twitch: {
    dynamicRewards?: boolean;
    rewardsPrefix?: string;
    rewards?: RewardSetting[];
  };
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
    background: undefined,
  },
  integration: {
    twitch: {
      dynamicRewards: false,
      rewardsPrefix: 'ставка',
      rewards: [{ cost: 5000, color: '#fff' }],
    },
  },
};

const mergeCheck = (obj: any, src: any): any => (src === undefined ? obj : src);

const aucSettingsSlice = createSlice({
  name: 'aucSettings',
  initialState,
  reducers: {
    setAucSettings(state, action: PayloadAction<SettingFields>): void {
      state.settings = mergewith(state.settings, action.payload, mergeCheck);
    },
    setIntegration(state, action: PayloadAction<IntegrationFields>): void {
      state.integration = mergewith(state.integration, action.payload, mergeCheck);
    },
  },
});

export const { setAucSettings, setIntegration } = aucSettingsSlice.actions;

export const loadUserData = async (dispatch: ThunkDispatch<{}, {}, Action>): Promise<void> => {
  const { username, settings, integration, hasDAAuth } = await getUserData();

  if (settings) {
    dispatch(setAucSettings(settings));
  }
  if (integration) {
    dispatch(setIntegration(integration));
  }
  dispatch(setUsername(username));
  dispatch(setHasDAAuth(hasDAAuth));
};

export default aucSettingsSlice.reducer;
