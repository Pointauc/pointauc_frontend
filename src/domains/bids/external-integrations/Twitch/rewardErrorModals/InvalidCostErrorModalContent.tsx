import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const InvalidCostErrorModalContent = () => {
  const { t } = useTranslation();

  return (
    <Stack gap='sm'>
      <Text>{t('integration.twitch.connectionError.invalidCost.description')}</Text>
      <Text c='dimmed' size='sm'>
        {t('integration.twitch.connectionError.invalidCost.fix')}
      </Text>
    </Stack>
  );
};

export default InvalidCostErrorModalContent;
