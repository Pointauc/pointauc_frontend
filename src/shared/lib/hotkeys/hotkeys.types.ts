import type { HotkeyCallbackContext, RegisterableHotkey } from '@tanstack/react-hotkeys';
import type { TFunction } from 'i18next';

export const HOTKEY_ACTION_IDS = {
  navigateAuction: 'navigateAuction',
  navigateWheel: 'navigateWheel',
  navigateSettings: 'navigateSettings',
  navigateOverlays: 'navigateOverlays',
  navigateTicketVerification: 'navigateTicketVerification',
  timerToggle: 'timerToggle',
  timerAddTime: 'timerAddTime',
  timerSubtractTime: 'timerSubtractTime',
  timerAddTimeDouble: 'timerAddTimeDouble',
  firstBidNew: 'firstBidNew',
  firstBidAddToLot: 'firstBidAddToLot',
  integrationsToggleAll: 'integrationsToggleAll',
  integrationsToggleDonations: 'integrationsToggleDonations',
  integrationsToggleChannelPoints: 'integrationsToggleChannelPoints',
  wheelSpin: 'wheelSpin',
} as const;

export type HotkeyActionId = (typeof HOTKEY_ACTION_IDS)[keyof typeof HOTKEY_ACTION_IDS];

export interface HotkeyNotificationPayloadMap {
  [HOTKEY_ACTION_IDS.navigateAuction]: never;
  [HOTKEY_ACTION_IDS.navigateWheel]: never;
  [HOTKEY_ACTION_IDS.navigateSettings]: never;
  [HOTKEY_ACTION_IDS.navigateOverlays]: never;
  [HOTKEY_ACTION_IDS.navigateTicketVerification]: never;
  [HOTKEY_ACTION_IDS.timerToggle]: {
    state: 'continue' | 'pause';
  };
  [HOTKEY_ACTION_IDS.timerAddTime]: undefined;
  [HOTKEY_ACTION_IDS.timerSubtractTime]: undefined;
  [HOTKEY_ACTION_IDS.timerAddTimeDouble]: undefined;
  [HOTKEY_ACTION_IDS.firstBidNew]: {
    name: string;
  };
  [HOTKEY_ACTION_IDS.firstBidAddToLot]: {
    bidName: string;
    lotName: string;
  };
  [HOTKEY_ACTION_IDS.integrationsToggleAll]: {
    enabled: boolean;
  };
  [HOTKEY_ACTION_IDS.integrationsToggleDonations]: {
    enabled: boolean;
  };
  [HOTKEY_ACTION_IDS.integrationsToggleChannelPoints]: {
    enabled: boolean;
  };
  [HOTKEY_ACTION_IDS.wheelSpin]: never;
}

export type HotkeyNotificationPayload<ActionId extends HotkeyActionId> = HotkeyNotificationPayloadMap[ActionId];

interface HotkeyNotificationDefinitionBase<ActionId extends HotkeyActionId> {
  buildMessage: (payload: HotkeyNotificationPayload<ActionId>, t: TFunction) => string;
}

export type HotkeyNotificationDefinition<ActionId extends HotkeyActionId> = [
  HotkeyNotificationPayload<ActionId>,
] extends [never]
  ? never
  : [HotkeyNotificationPayload<ActionId>] extends [undefined]
  ? HotkeyNotificationDefinitionBase<ActionId> & {
      requiresPayload?: false;
    }
  : HotkeyNotificationDefinitionBase<ActionId> & {
      requiresPayload: true;
    };

export interface HotkeyDefinition<ActionId extends HotkeyActionId = HotkeyActionId> {
  binding: RegisterableHotkey;
  displayLabel: string;
  enabledRoutes?: string[];
  showTooltip: boolean;
  notification?: HotkeyNotificationDefinition<ActionId>;
}

type HotkeyNotificationControls<ActionId extends HotkeyActionId> = [HotkeyNotificationPayload<ActionId>] extends [never]
  ? {}
  : [HotkeyNotificationPayload<ActionId>] extends [undefined]
  ? {}
  : {
      setNotificationData: (payload: HotkeyNotificationPayload<ActionId>) => void;
    };

export type AppHotkeyCallbackContext<ActionId extends HotkeyActionId> = HotkeyCallbackContext &
  HotkeyNotificationControls<ActionId>;

export type AppHotkeyCallback<ActionId extends HotkeyActionId> = (
  event: KeyboardEvent,
  context: AppHotkeyCallbackContext<ActionId>,
) => void;
