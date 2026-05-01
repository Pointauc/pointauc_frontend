import ROUTES from '@constants/routes.constants';

import { HOTKEY_ACTION_IDS, type HotkeyActionId, type HotkeyDefinition } from './hotkeys.types';

interface HotkeyDefinitionRecord<ActionId extends HotkeyActionId> extends HotkeyDefinition<ActionId> {
  aliasBindings?: HotkeyDefinition<ActionId>['binding'][];
  navbarPath?: string;
}

type HotkeyDefinitions = {
  [ActionId in HotkeyActionId]: HotkeyDefinitionRecord<ActionId>;
};

const hotkeyDefinitions: HotkeyDefinitions = {
  [HOTKEY_ACTION_IDS.navigateAuction]: {
    binding: 'Q',
    displayLabel: 'Q',
    navbarPath: ROUTES.HOME,
    showTooltip: true,
  },
  [HOTKEY_ACTION_IDS.navigateWheel]: {
    binding: 'W',
    displayLabel: 'W',
    navbarPath: ROUTES.WHEEL,
    showTooltip: true,
  },
  [HOTKEY_ACTION_IDS.navigateSettings]: {
    binding: 'E',
    displayLabel: 'E',
    navbarPath: ROUTES.SETTINGS,
    showTooltip: true,
  },
  [HOTKEY_ACTION_IDS.navigateOverlays]: {
    binding: 'R',
    displayLabel: 'R',
    navbarPath: ROUTES.OVERLAYS,
    showTooltip: true,
  },
  [HOTKEY_ACTION_IDS.navigateTicketVerification]: {
    binding: 'T',
    displayLabel: 'T',
    navbarPath: ROUTES.TICKET_VERIFICATION_INFO,
    showTooltip: true,
  },
  [HOTKEY_ACTION_IDS.stopwatchToggle]: {
    binding: 'Space',
    displayLabel: 'Space',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: true,
    notification: {
      requiresPayload: true,
      buildMessage: ({ state }, t) => t(`hotkeys.notifications.stopwatch.${state}`),
    },
  },
  [HOTKEY_ACTION_IDS.stopwatchAddTime]: {
    binding: '=',
    aliasBindings: [{ key: 'Add' }],
    displayLabel: '=',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: true,
    notification: {
      buildMessage: (_, t) => t('hotkeys.notifications.stopwatch.addTime'),
    },
  },
  [HOTKEY_ACTION_IDS.stopwatchSubtractTime]: {
    binding: '-',
    displayLabel: '-',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: true,
    notification: {
      buildMessage: (_, t) => t('hotkeys.notifications.stopwatch.reduceTime'),
    },
  },
  [HOTKEY_ACTION_IDS.stopwatchAddTimeDouble]: {
    binding: { key: '=', shift: true },
    displayLabel: 'Shift + =',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: true,
    notification: {
      buildMessage: (_, t) => t('hotkeys.notifications.stopwatch.addTimeDouble'),
    },
  },
  [HOTKEY_ACTION_IDS.firstBidNew]: {
    binding: '1',
    displayLabel: '1',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: false,
    notification: {
      requiresPayload: true,
      buildMessage: ({ name }, t) => t('hotkeys.notifications.bid.new', { name }),
    },
  },
  [HOTKEY_ACTION_IDS.firstBidAddToLot]: {
    binding: '2',
    displayLabel: '2',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: false,
    notification: {
      requiresPayload: true,
      buildMessage: ({ bidName, lotName }, t) => t('hotkeys.notifications.bid.addToLot', { bidName, lotName }),
    },
  },
  [HOTKEY_ACTION_IDS.integrationsToggleAll]: {
    binding: 'A',
    displayLabel: 'A',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: false,
    notification: {
      requiresPayload: true,
      buildMessage: ({ enabled }, t) =>
        t('hotkeys.notifications.integrations.toggleGroup', {
          target: t('integration.groups.integrations'),
          state: enabled
            ? t('hotkeys.notifications.integrations.enabled')
            : t('hotkeys.notifications.integrations.disabled'),
        }),
    },
  },
  [HOTKEY_ACTION_IDS.integrationsToggleDonations]: {
    binding: 'D',
    displayLabel: 'D',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: false,
    notification: {
      requiresPayload: true,
      buildMessage: ({ enabled }, t) =>
        t('hotkeys.notifications.integrations.toggleGroup', {
          target: t('integration.groups.donations'),
          state: enabled
            ? t('hotkeys.notifications.integrations.enabled')
            : t('hotkeys.notifications.integrations.disabled'),
        }),
    },
  },
  [HOTKEY_ACTION_IDS.integrationsToggleChannelPoints]: {
    binding: 'C',
    displayLabel: 'C',
    enabledRoutes: [ROUTES.HOME],
    showTooltip: false,
    notification: {
      requiresPayload: true,
      buildMessage: ({ enabled }, t) =>
        t('hotkeys.notifications.integrations.toggleGroup', {
          target: t('integration.groups.channelPoints'),
          state: enabled
            ? t('hotkeys.notifications.integrations.enabled')
            : t('hotkeys.notifications.integrations.disabled'),
        }),
    },
  },
  [HOTKEY_ACTION_IDS.wheelSpin]: {
    binding: 'Space',
    displayLabel: 'Space',
    enabledRoutes: [ROUTES.WHEEL],
    showTooltip: false,
  },
};

export const getHotkeyDefinition = <ActionId extends HotkeyActionId>(
  actionId: ActionId,
): HotkeyDefinitionRecord<ActionId> => hotkeyDefinitions[actionId];

export const resolveHotkeyBindings = (actionId: HotkeyActionId): HotkeyDefinition['binding'][] => {
  const definition = getHotkeyDefinition(actionId);

  return [definition.binding, ...(definition.aliasBindings ?? [])];
};

export const resolveHotkeyDisplayLabel = (actionId: HotkeyActionId): string =>
  getHotkeyDefinition(actionId).displayLabel;

export const resolveNavbarHotkeyActionId = (path: string): HotkeyActionId | undefined => {
  return (Object.entries(hotkeyDefinitions) as [HotkeyActionId, HotkeyDefinitionRecord<HotkeyActionId>][]).find(
    ([, definition]) => definition.navbarPath === path,
  )?.[0];
};

export const resolveNavbarPathForAction = (actionId: HotkeyActionId): string | undefined => {
  return getHotkeyDefinition(actionId).navbarPath;
};
