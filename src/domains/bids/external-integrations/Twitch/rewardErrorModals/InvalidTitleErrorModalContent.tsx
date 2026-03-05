import { Anchor, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { modals } from '@mantine/modals';

import ROUTES from '@constants/routes.constants';

const InvalidTitleErrorModalContent = () => {
  const { t } = useTranslation();

  return (
    <Stack gap='sm'>
      <Text>{t('integration.twitch.connectionError.invalidTitle.description')}</Text>
      <Text c='dimmed' size='sm'>
        {t('integration.twitch.connectionError.invalidTitle.fix')}
      </Text>
      <Anchor component={Link} to={ROUTES.INTEGRATIONS} size='sm' fw={500} onClick={() => modals.closeAll()}>
        {t('integration.twitch.connectionError.invalidTitle.openRewardSettings')}
      </Anchor>
    </Stack>
  );
};

export default InvalidTitleErrorModalContent;
