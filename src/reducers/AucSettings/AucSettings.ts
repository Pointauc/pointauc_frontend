import { createSlice, PayloadAction, ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';
import { mergeWith, omit } from 'es-toolkit';

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
import { checkIsBackgroundMigrated, saveAppSettings } from '@shared/lib/database/appSettingsDb';

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
      const previousBackground = state.settings.background;
      const mergedSettings = mergeWith(state.settings, action.payload, mergeCheck);
      // Keep the legacy background copy in localStorage until IndexedDB takes over,
      // so settings written before the migration is confirmed cannot erase it.
      const settingsToStore = checkIsBackgroundMigrated()
        ? omit(mergedSettings, ['background'])
        : mergedSettings;
      localStorage.setItem('settings', JSON.stringify(settingsToStore));

      const nextBackground = mergedSettings.background ?? null;
      if ('background' in action.payload && nextBackground !== (previousBackground ?? null)) {
        void saveAppSettings({ background: nextBackground }).catch((err) => {
          console.error('Failed to save background setting to IndexedDB', err);
        });
      }

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

export const loadUserData =
  () =>
  async (
    dispatch: ThunkDispatch<RootState, {}, Action>,
    getState: () => RootState,
  ): Promise<GetUserDto> => {
    const user = await getUserData();
    const {
      twitchAuth,
      kickAuth,
      vkVideoLiveAuth,
      daAuth,
      tourniquetAuth,
      donatePayAuth,
      donatePayEuAuth,
      activeSettingsPresetId,
      ihaqAuth,
      userId,
      donateHelperAuth,
      donliAuth,
    } = user;
    const donatexAuth = getDonateXAuthData();

    dispatch(
      setUserState({
        username:
          twitchAuth?.username ??
          kickAuth?.username ??
          vkVideoLiveAuth?.username ??
          daAuth?.username ??
          donatePayAuth?.username ??
          donatexAuth?.username ??
          donliAuth?.username ??
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
          donli: donliAuth,
        },
      }),
    );

    if (localStorage.getItem('isColorResetDone') !== 'true') {
      dispatch(setAucSettings({ primaryColor: COLORS.THEME.PRIMARY }));
      localStorage.setItem('isColorResetDone', 'true');
    }
    // if (localStorage.getItem('minTime')) {
    //   dispatch(saveSettings({ minTime: minTime ? Number(minTime) : activeSettings.minTime }));
    //   localStorage.removeItem('isMinTimeActive');
    //   localStorage.removeItem('minTime');
    // }
    dispatch(validateIntegrations);

    if (activeSettingsPresetId) {
      try {
        await updateSettings({ settings: getState().aucSettings.settings, id: activeSettingsPresetId });
      } catch (err) {
        console.error('Failed to sync local settings to backend', err);
      }
    }

    return user;
  };

export default aucSettingsSlice.reducer;
