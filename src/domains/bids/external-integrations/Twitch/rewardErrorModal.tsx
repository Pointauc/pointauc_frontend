/* eslint-disable react-refresh/only-export-components */
import { Anchor, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import i18next from 'i18next';

import { RootState } from '@reducers';

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

interface ErrorContentProps {
  errorKey: string;
}

const ERRORS_WITH_DASHBOARD_LINK = new Set(['maxRewards', 'duplicateTitle']);

const TwitchRewardErrorContent = ({ errorKey }: ErrorContentProps) => {
  const { t } = useTranslation();
  const twitchUsername = useSelector((state: RootState) => state.user.authData.twitch?.username);

  const dashboardUrl = twitchUsername
    ? `https://dashboard.twitch.tv/u/${twitchUsername}/viewer-rewards/channel-points/rewards`
    : 'https://dashboard.twitch.tv/viewer-rewards/channel-points/rewards';

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
    </Stack>
  );
};

export const openTwitchRewardErrorModal = (error: unknown): void => {
  const message = extractMessage(error);
  const errorKey = resolveErrorKey(message);

  modals.open({
    title: i18next.t('integration.twitch.connectionError.title'),
    children: <TwitchRewardErrorContent errorKey={errorKey} />,
  });
};
