import { type HotkeyCallback, type UseHotkeyOptions, useHotkeys } from '@tanstack/react-hotkeys';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { getHotkeyDefinition, resolveHotkeyBindings } from './hotkeys.registry';
import { checkIsHotkeyActionEnabledOnPath } from './hotkeys.routes';
import { showHotkeyNotification } from './showHotkeyNotification';

import type { AppHotkeyCallback, AppHotkeyCallbackContext, HotkeyActionId, HotkeyNotificationPayload } from './hotkeys.types';

interface UseAppHotkeyOptions extends Omit<UseHotkeyOptions, 'enabled'> {
  enabled?: boolean;
}

export const useAppHotkey = <ActionId extends HotkeyActionId>(
  actionId: ActionId,
  callback: AppHotkeyCallback<ActionId>,
  options: UseAppHotkeyOptions = {},
) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { enabled = true, ...hotkeyOptions } = options;
  const definition = getHotkeyDefinition(actionId);
  const isEnabled = enabled && checkIsHotkeyActionEnabledOnPath(actionId, pathname);
  const bindings = useMemo(() => resolveHotkeyBindings(actionId), [actionId]);
  const wrappedCallback = useMemo<HotkeyCallback>(() => {
    return (event, context) => {
      const notificationDefinition = definition.notification;

      if (!notificationDefinition) {
        callback(event, context as AppHotkeyCallbackContext<ActionId>);

        return;
      }

      if (!notificationDefinition.requiresPayload) {
        callback(event, context as AppHotkeyCallbackContext<ActionId>);
        showHotkeyNotification({
          actionId,
          notificationData: undefined as HotkeyNotificationPayload<ActionId>,
          t,
        });

        return;
      }

      let notificationData: HotkeyNotificationPayload<ActionId> | undefined;

      callback(event, {
        ...context,
        setNotificationData: (payload: HotkeyNotificationPayload<ActionId>) => {
          notificationData = payload;
        },
      } as AppHotkeyCallbackContext<ActionId>);

      if (notificationData !== undefined) {
        showHotkeyNotification({
          actionId,
          notificationData,
          t,
        });
      }
    };
  }, [actionId, callback, definition.notification, t]);
  const definitions = useMemo(
    () =>
      bindings.map((hotkey) => ({
        hotkey,
        callback: wrappedCallback,
        options: {
          ...hotkeyOptions,
          enabled: isEnabled,
        },
      })),
    [bindings, wrappedCallback, hotkeyOptions, isEnabled],
  );

  useHotkeys(definitions);
};
