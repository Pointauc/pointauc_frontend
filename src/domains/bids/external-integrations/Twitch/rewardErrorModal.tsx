/* eslint-disable react-refresh/only-export-components */
import { modals } from '@mantine/modals';
import i18next from 'i18next';

import DuplicateTitleErrorModalContent from '@domains/bids/external-integrations/Twitch/rewardErrorModals/DuplicateTitleErrorModalContent';
import InvalidCostErrorModalContent from '@domains/bids/external-integrations/Twitch/rewardErrorModals/InvalidCostErrorModalContent';
import InvalidTitleErrorModalContent from '@domains/bids/external-integrations/Twitch/rewardErrorModals/InvalidTitleErrorModalContent';
import MaxRewardsErrorModalContent from '@domains/bids/external-integrations/Twitch/rewardErrorModals/MaxRewardsErrorModalContent';
import UnknownErrorModalContent from '@domains/bids/external-integrations/Twitch/rewardErrorModals/UnknownErrorModalContent';
import { store } from '@store';

/**
 * Maps Twitch API error codes to i18n keys.
 * Only `CREATE_CUSTOM_REWARD_DUPLICATE_REWARD` is confirmed from a real API response.
 * The remaining keys follow the same naming pattern but are not officially documented by Twitch
 * and should be verified against actual API responses before relying on them.
 */
const TWITCH_ERROR_CODE_MAP: Record<string, string> = {
  CREATE_CUSTOM_REWARD_MAX_REWARDS: 'maxRewards', // unconfirmed
  ['The parameter "title" was malformed: the value must be less than or equal to 45']: 'invalidTitle', // unconfirmed
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

const getErrorModalContent = (errorKey: string, errorDetails: string) => {
  switch (errorKey) {
    case 'maxRewards':
      return <MaxRewardsErrorModalContent />;
    case 'invalidTitle':
      return <InvalidTitleErrorModalContent />;
    case 'duplicateTitle':
      return <DuplicateTitleErrorModalContent />;
    case 'invalidCost':
      return <InvalidCostErrorModalContent />;
    default:
      return <UnknownErrorModalContent errorDetails={errorDetails} />;
  }
};

export const openTwitchRewardErrorModal = (error: unknown): void => {
  const message = extractMessage(error);
  const errorKey = resolveErrorKey(message);
  const errorDetails = buildErrorDetails(error);

  modals.open({
    title: i18next.t('integration.twitch.connectionError.title'),
    children: getErrorModalContent(errorKey, errorDetails),
  });
};
