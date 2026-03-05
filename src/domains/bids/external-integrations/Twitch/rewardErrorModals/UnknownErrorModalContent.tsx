import { Button, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

interface UnknownErrorModalContentProps {
  errorDetails: string;
}

const useCopyErrorHandler = (errorDetails: string): (() => Promise<void>) => {
  const { t } = useTranslation();

  return async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(errorDetails);
      notifications.show({ message: t('common.copied'), color: 'green' });
    } catch {
      notifications.show({ message: t('common.copyFailed'), color: 'red' });
    }
  };
};

const UnknownErrorModalContent = ({ errorDetails }: UnknownErrorModalContentProps) => {
  const { t } = useTranslation();
  const handleCopyError = useCopyErrorHandler(errorDetails);

  return (
    <Stack gap='sm'>
      <Text>{t('integration.twitch.connectionError.unknown.description')}</Text>
      <Text c='dimmed' size='sm'>
        {t('integration.twitch.connectionError.unknown.fix')}
      </Text>
      <Button variant='light' onClick={handleCopyError}>
        {t('integration.twitch.connectionError.unknown.copyErrorMessage')}
      </Button>
    </Stack>
  );
};

export default UnknownErrorModalContent;
