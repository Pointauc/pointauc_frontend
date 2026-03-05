import { Anchor, Stack, Text } from '@mantine/core';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { getDashboardUrl } from '@domains/bids/external-integrations/Twitch/rewardErrorModals/shared';
import { RootState } from '@reducers';

const MaxRewardsErrorModalContent = () => {
  const { t } = useTranslation();
  const twitchUsername = useSelector((state: RootState) => state.user.authData.twitch?.username);
  const dashboardUrl = getDashboardUrl(twitchUsername);

  return (
    <Stack gap='sm'>
      <Text>{t('integration.twitch.connectionError.maxRewards.description')}</Text>
      <Text c='dimmed' size='sm'>
        <Trans
          i18nKey='integration.twitch.connectionError.maxRewards.fix'
          components={{
            1: <Anchor href={dashboardUrl} target='_blank' rel='noopener noreferrer' />,
          }}
        />
      </Text>
    </Stack>
  );
};

export default MaxRewardsErrorModalContent;
