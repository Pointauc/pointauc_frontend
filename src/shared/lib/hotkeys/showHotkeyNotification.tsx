import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { renderHotkeyDisplayPart, splitHotkeyDisplayLabel } from './hotkeyDisplay';
import { getHotkeyDefinition, resolveHotkeyDisplayLabel } from './hotkeys.registry';

import type { TFunction } from 'i18next';
import type { HotkeyActionId, HotkeyNotificationPayload } from './hotkeys.types';

interface ShowHotkeyNotificationParams<ActionId extends HotkeyActionId> {
  actionId: ActionId;
  notificationData: HotkeyNotificationPayload<ActionId>;
  t: TFunction;
}

interface ActiveHotkeyNotificationRecord {
  count: number;
  id: string;
  autoCloseOffset: 0 | 1;
}

const HOTKEY_NOTIFICATION_AUTO_CLOSE = 1000;

const activeHotkeyNotifications = new Map<string, ActiveHotkeyNotificationRecord>();

const serializeHotkeyNotificationData = (value: unknown): string => {
  if (value === null || value === undefined) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(serializeHotkeyNotificationData).join(',')}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));

    return `{${entries.map(([key, entryValue]) => `${key}:${serializeHotkeyNotificationData(entryValue)}`).join(',')}}`;
  }

  return String(value);
};

const renderHotkeyNotificationMessage = (message: string, hotkeyLabel: string, count: number) => {
  const hotkeyParts = splitHotkeyDisplayLabel(hotkeyLabel);

  return (
    <span className='inline-flex items-center gap-2'>
      <Text span c='white'>
        {message}
      </Text>
      <Text span c='dimmed' size='sm' className='inline-flex items-center gap-1'>
        {hotkeyParts.map((part, index) => (
          <span key={`${part}-${index}`} className='inline-flex items-center gap-1'>
            {index > 0 ? <span>+</span> : null}
            <span className='inline-flex items-center'>{renderHotkeyDisplayPart(part)}</span>
          </span>
        ))}
      </Text>
      {count > 1 ? (
        <Text span c='dimmed' size='sm'>
          x{count}
        </Text>
      ) : null}
    </span>
  );
};

const createHotkeyNotificationId = (actionId: HotkeyActionId) => `hotkey-${actionId}-${Date.now()}`;

export const showHotkeyNotification = <ActionId extends HotkeyActionId>({
  actionId,
  notificationData,
  t,
}: ShowHotkeyNotificationParams<ActionId>) => {
  const notificationDefinition = getHotkeyDefinition(actionId).notification;

  if (!notificationDefinition) {
    return;
  }

  const message = notificationDefinition.buildMessage(notificationData, t);
  const hotkeyLabel = resolveHotkeyDisplayLabel(actionId);
  const deduplicationKey = `${actionId}:${serializeHotkeyNotificationData(notificationData)}`;
  const activeNotification = activeHotkeyNotifications.get(deduplicationKey);

  if (activeNotification) {
    const nextCount = activeNotification.count + 1;
    const nextAutoCloseOffset: 0 | 1 = activeNotification.autoCloseOffset === 0 ? 1 : 0;

    activeHotkeyNotifications.set(deduplicationKey, {
      count: nextCount,
      id: activeNotification.id,
      autoCloseOffset: nextAutoCloseOffset,
    });
    notifications.update({
      id: activeNotification.id,
      message: renderHotkeyNotificationMessage(message, hotkeyLabel, nextCount),
      autoClose: HOTKEY_NOTIFICATION_AUTO_CLOSE + nextAutoCloseOffset,
      onClose: () => {
        const record = activeHotkeyNotifications.get(deduplicationKey);

        if (record?.id === activeNotification.id) {
          activeHotkeyNotifications.delete(deduplicationKey);
        }
      },
    });

    return;
  }

  const id = createHotkeyNotificationId(actionId);

  activeHotkeyNotifications.set(deduplicationKey, {
    count: 1,
    id,
    autoCloseOffset: 0,
  });

  notifications.show({
    id,
    message: renderHotkeyNotificationMessage(message, hotkeyLabel, 1),
    color: 'dark',
    position: 'bottom-right',
    withCloseButton: false,
    autoClose: HOTKEY_NOTIFICATION_AUTO_CLOSE,
    onClose: () => {
      const record = activeHotkeyNotifications.get(deduplicationKey);

      if (record?.id === id) {
        activeHotkeyNotifications.delete(deduplicationKey);
      }
    },
  });
};
