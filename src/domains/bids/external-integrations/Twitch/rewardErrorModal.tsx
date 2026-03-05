/* eslint-disable react-refresh/only-export-components */
import { Anchor, Button, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import i18next from 'i18next';

import { RootState } from '@reducers';
import { store } from '@store';

/**
 * Maps Twitch API error codes to i18n keys.
 * Only `CREATE_CUSTOM_REWARD_DUPLICATE_REWARD` is confirmed from a real API response.
 * The remaining keys follow the same naming pattern but are not officially documented by Twitch
 * and should be verified against actual API responses before relying on them.
 */
const TWITCH_ERROR_CODE_MAP: Record<string, string> = {
  CREATE_CUSTOM_REWARD_MAX_REWARDS: 'maxRewards', // unconfirmed
  CREATE_CUSTOM_REWARD_INVALID_TITLE: 'invalidTitle', // unconfirmed
  CREATE_CUSTOM_REWARD_DUPLICATE_REWARD: 'duplicateTitle', // confirmed
  CREATE_CUSTOM_REWARD_INVALID_COST: 'invalidCost', // unconfirmed
};

const resolveErrorKey = (message: string): string => TWITCH_ERROR_CODE_MAP[message] ?? 'unknown';

const extractMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  return String(error ?? '');
};

const getCircularReplacer = () => {
  const seenObjects = new WeakSet<object>();

  return (_key: string, value: unknown): unknown => {
    if (!value || typeof value !== 'object') return value;
    if (seenObjects.has(value as object)) return '[Circular]';
    seenObjects.add(value as object);
    return value;
  };
};

const serializeError = (error: unknown): string => {
  if (error instanceof Error) {
    const errorLines = [`name: ${error.name}`, `message: ${error.message}`, `stack: ${error.stack ?? 'N/A'}`];

    if ('cause' in error && error.cause !== undefined) {
      errorLines.push(`cause: ${serializeError(error.cause)}`);
    }

    return errorLines.join('\n');
  }

  if (typeof error === 'string') return error;
  if (error === null) return 'null';
  if (error === undefined) return 'undefined';

  if (typeof error === 'object') {
    try {
      return JSON.stringify(error, getCircularReplacer(), 2);
    } catch {
      return String(error);
    }
  }

  return String(error);
};

const buildErrorDetails = (error: unknown): string => {
  const extractedMessage = extractMessage(error);
  const userId = store.getState().user.pointaucUserId;

  return [
    'Twitch reward creation error details',
    `user: ${userId}`,
    `time: ${new Date().toISOString()}`,
    `resolvedKey: ${resolveErrorKey(extractedMessage)}`,
    `message: ${extractedMessage || 'N/A'}`,
    'error:',
    serializeError(error),
  ].join('\n');
};

interface ErrorContentProps {
  errorKey: string;
  errorDetails: string;
}

const ERRORS_WITH_DASHBOARD_LINK = new Set(['maxRewards', 'duplicateTitle']);

const TwitchRewardErrorContent = ({ errorKey, errorDetails }: ErrorContentProps) => {
  const { t } = useTranslation();
  const twitchUsername = useSelector((state: RootState) => state.user.authData.twitch?.username);
  const checkIsUnknownError = errorKey === 'unknown';

  const dashboardUrl = twitchUsername
    ? `https://dashboard.twitch.tv/u/${twitchUsername}/viewer-rewards/channel-points/rewards`
    : 'https://dashboard.twitch.tv/viewer-rewards/channel-points/rewards';

  const handleCopyError = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(errorDetails);
      notifications.show({ message: t('common.copied'), color: 'green' });
    } catch {
      notifications.show({ message: t('common.copyFailed'), color: 'red' });
    }
  };

  return (
    <Stack gap='sm'>
      <Text>{t(`integration.twitch.connectionError.${errorKey}.description`)}</Text>
      <Text c='dimmed' size='sm'>
        {ERRORS_WITH_DASHBOARD_LINK.has(errorKey) ? (
          <Trans
            i18nKey={`integration.twitch.connectionError.${errorKey}.fix`}
            components={{
              1: <Anchor href={dashboardUrl} target='_blank' rel='noopener noreferrer' />,
            }}
          />
        ) : (
          t(`integration.twitch.connectionError.${errorKey}.fix`)
        )}
      </Text>
      {checkIsUnknownError && (
        <Button variant='light' onClick={handleCopyError}>
          {t('integration.twitch.connectionError.unknown.copyErrorMessage')}
        </Button>
      )}
    </Stack>
  );
};

export const openTwitchRewardErrorModal = (error: unknown): void => {
  const message = extractMessage(error);
  const errorKey = resolveErrorKey(message);
  const errorDetails = buildErrorDetails(error);

  modals.open({
    title: i18next.t('integration.twitch.connectionError.title'),
    children: <TwitchRewardErrorContent errorKey={errorKey} errorDetails={errorDetails} />,
  });
};
