import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { mergeWith } from 'es-toolkit';

import { getUserData, updateSettings } from '@api/userApi.ts';
import { GetUserDto } from '@models/user.model.ts';
import { AucSettingsDto, resolveBackgroundType } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { aukus } from '@components/Event/events.ts';
import { BidNameStrategy } from '@enums/bid.enum';
import { getDonateXAuthData } from '@domains/bids/external-integrations/DonateX/auth.ts';
import { DEFAULT_ALLOWED_DOMAINS } from '@domains/links/config/defaultAllowedDomains';
import { isBrowser } from '@utils/ssr.ts';

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
  activeRuleId: string | null;
}

export interface AucSettingsState {
  view: ViewSettings;
  settings: AucSettingsDto & { events: EventsSettings } & SettingsMissingOnBackend;
}
const showRules = isBrowser ? localStorage.getItem('showRules') : null;
const storedSettings =
  isBrowser && localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings') as string) : null;

const defaultSettings: AucSettingsState['settings'] = {
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
  isLotLinkParsingEnabled: true,
  allowedDomains: DEFAULT_ALLOWED_DOMAINS,
  ignoreExternalLinkConfirmation: false,
  showTotalTime: false,
  activeRuleId: null,
  events: {
    aukus: {
      enabled: isBrowser ? aukus.enabled.get() : true,
    },
  },
};

const resolveLotLinkParsingSetting = (settings: Record<string, unknown> | null): boolean => {
  return settings?.isLotLinkParsingEnabled as boolean;
};

export const initialState: AucSettingsState = {
  view: {
    compact: false,
    showRules: showRules === 'true',
    autoScroll: false,
  },
  settings: storedSettings
    ? {
        ...defaultSettings,
        ...storedSettings,
        isLotLinkParsingEnabled: resolveLotLinkParsingSetting(storedSettings),
        backgroundType: resolveBackgroundType(storedSettings.background, storedSettings.backgroundType),
      }
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
  (settings: Partial<AucSettingsState['settings']>) =>
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
  const {
    twitchAuth,
    kickAuth,
    vkVideoLiveAuth,
    activeSettings,
    daAuth,
    tourniquetAuth,
    donatePayAuth,
    donatePayEuAuth,
    activeSettingsPresetId,
    ihaqAuth,
    userId,
    donateHelperAuth,
  } = user;
  const donatexAuth = getDonateXAuthData();

  if (activeSettings) {
    const { startTime, timeStep, ...settings } = activeSettings;
    dispatch(
      setAucSettings({
        ...settings,
        isLotLinkParsingEnabled: resolveLotLinkParsingSetting(settings as Record<string, unknown>),
        backgroundType: resolveBackgroundType(settings.background, settings.backgroundType),
        primaryColor:
          localStorage.getItem('isColorResetDone') !== 'true' ? COLORS.THEME.PRIMARY : settings.primaryColor,
      }),
    );
  }
  dispatch(
    setUserState({
      username:
        twitchAuth?.username ??
        kickAuth?.username ??
        vkVideoLiveAuth?.username ??
        daAuth?.username ??
        donatePayAuth?.username ??
        donatexAuth?.username ??
        'Empty',
      userId: twitchAuth?.id ?? kickAuth?.id ?? vkVideoLiveAuth?.id,
      pointaucUserId: userId,
      activeSettingsPresetId,
      authData: {
        donatePay: donatePayAuth,
        donatePayEu: donatePayEuAuth,
        da: daAuth,
        twitch: twitchAuth,
        kick: kickAuth,
        vkVideoLive: vkVideoLiveAuth,
        tourniquet: tourniquetAuth,
        ihaq: ihaqAuth,
        donatex: donatexAuth,
        donateHelper: donateHelperAuth,
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
