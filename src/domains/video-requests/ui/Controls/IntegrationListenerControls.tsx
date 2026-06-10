import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import IntegrationListenerButtonGroup from '@domains/video-requests/ui/Controls/IntegrationListenerButtonGroup';
import IntegrationSubscriptionLogins from '@pages/auction/IntegrationSubscription/Logins';

interface IntegrationListenerControlsProps {
  listener: ReturnType<typeof useVideoRequestListener>;
  variant?: 'inline' | 'queue';
}

const IntegrationListenerControls = ({ listener, variant = 'inline' }: IntegrationListenerControlsProps) => {
  const { t } = useTranslation();

  if (variant === 'queue') {
    return <IntegrationListenerButtonGroup listener={listener} variant='queue' />;
  }

  return (
    <section className='bg-paper-900 elevated-3 w-full max-w-3xl rounded-md p-4'>
      <Stack gap='sm'>
        <div>
          <Text fw={700}>{t('videoRequests.listener.inlineTitle')}</Text>
          <Text size='sm' className='text-dimmed'>
            {t('videoRequests.listener.inlineDescription')}
          </Text>
        </div>

        <IntegrationListenerButtonGroup listener={listener} />
        <IntegrationSubscriptionLogins integrations={listener.unavailableIntegrations} />
      </Stack>
    </section>
  );
};

export default IntegrationListenerControls;
