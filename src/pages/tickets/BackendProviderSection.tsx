import { Alert, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconServer } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/**
 * Section shown for tickets whose random number was generated entirely by the
 * PointAuc server (Random.org quota exhausted or unavailable). There is no
 * third-party signature to check, so the page domain itself is the anchor of trust.
 */
const BackendProviderSection = () => {
  const { t } = useTranslation();

  return (
    <Card shadow='sm' padding='lg' radius='md' withBorder>
      <Stack gap='sm'>
        <Group gap='xs' align='center'>
          <IconServer size={22} />
          <Title order={3}>{t('tickets.verificationPage.backendProvider.title')}</Title>
        </Group>
        <Text size='sm'>{t('tickets.verificationPage.backendProvider.description')}</Text>
        <Alert icon={<IconAlertCircle size={20} />} color='orange' variant='light'>
          {t('tickets.verificationPage.backendProvider.domainWarning')}
        </Alert>
      </Stack>
    </Card>
  );
};

export default BackendProviderSection;
