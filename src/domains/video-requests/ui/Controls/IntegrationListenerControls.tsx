import { Badge, Checkbox, Group, Popover, Stack, Switch, Text } from '@mantine/core';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VideoRequestBidGroup } from '@domains/video-requests/model/types';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';

interface IntegrationListenerControlsProps {
  listener: ReturnType<typeof useVideoRequestListener>;
  variant?: 'inline' | 'queue';
}

const BID_GROUPS: VideoRequestBidGroup[] = ['donations', 'channelPoints'];

const IntegrationGroupCards = ({ listener }: Pick<IntegrationListenerControlsProps, 'listener'>) => {
  const { t } = useTranslation();
  const listeningSettings = listener.settings?.listening;

  return (
    <Stack gap='sm'>
      {BID_GROUPS.map((group) => {
        const groupIntegrations = listener.availableIntegrationsByGroup[group];
        const isChecked = Boolean(listeningSettings?.activeBidGroups.includes(group));

        return (
          <Checkbox.Card
            key={group}
            checked={isChecked}
            disabled={listener.isLoading || listener.isSaving}
            radius='md'
            className='border-paper-700 bg-paper-950 p-3 transition-colors hover:border-paper-500 data-[checked=true]:border-primary-500 data-[checked=true]:bg-primary-light'
            onClick={() => void listener.toggleBidGroup(group, !isChecked)}
            aria-label={t(`videoRequests.listener.groups.${group}`)}
          >
            <Group align='flex-start' gap='sm' wrap='nowrap'>
              <Checkbox.Indicator />
              <div className='min-w-0 flex-1'>
                <Group justify='space-between' gap='xs' wrap='nowrap'>
                  <Text fw={650} size='sm' className='text-paper-50'>
                    {t(`videoRequests.listener.groups.${group}`)}
                  </Text>
                  <Badge size='xs' color={groupIntegrations.length > 0 ? 'green' : 'gray'} variant='light'>
                    {groupIntegrations.length}
                  </Badge>
                </Group>
                {groupIntegrations.length === 0 ? (
                  <Text size='xs' className='mt-1 text-dimmed'>
                    {t('videoRequests.listener.noAuthenticatedIntegrations')}
                  </Text>
                ) : (
                  <Stack gap={4} className='mt-2'>
                    {groupIntegrations.map((integration) => {
                      const subscription = listener.subscriptions[integration.id];
                      const statusKey = subscription?.loading
                        ? 'loading'
                        : subscription?.subscribed
                          ? 'subscribed'
                          : 'idle';

                      return (
                        <Group key={integration.id} justify='space-between' gap='xs' wrap='nowrap'>
                          <Text size='xs' className='truncate text-paper-200'>
                            {t(`integration.${integration.id}.name`)}
                          </Text>
                          <Badge
                            size='xs'
                            variant='light'
                            color={statusKey === 'subscribed' ? 'green' : statusKey === 'loading' ? 'yellow' : 'gray'}
                          >
                            {t(`videoRequests.listener.integrationStatus.${statusKey}`)}
                          </Badge>
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </div>
            </Group>
          </Checkbox.Card>
        );
      })}
    </Stack>
  );
};

const QueueListenerControl = ({ listener }: Pick<IntegrationListenerControlsProps, 'listener'>) => {
  const { t } = useTranslation();
  const isEnabled = Boolean(listener.settings?.listening.isEnabled);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const openPopover = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setIsPopoverOpen(true);
  };

  const scheduleClose = () => {
    closeTimerRef.current = window.setTimeout(() => setIsPopoverOpen(false), 160);
  };

  return (
    <Popover opened={isPopoverOpen} width={350} position='left-start' withArrow shadow='lg'>
      <Popover.Target>
        <div onMouseEnter={openPopover} onMouseLeave={scheduleClose}>
          <Switch
            size='sm'
            checked={isEnabled}
            disabled={listener.isLoading || listener.isSaving}
            onChange={(event) => void listener.setListeningEnabled(event.currentTarget.checked)}
            label={t('videoRequests.listener.queueSwitchLabel')}
            aria-label={t('videoRequests.listener.enable')}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown
        className='border-paper-700 bg-paper-900 p-3'
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClose}
      >
        <Stack gap='xs'>
          <Text fw={650} size='sm' className='text-paper-50'>
            {t('videoRequests.listener.integrationsTitle')}
          </Text>
          <IntegrationGroupCards listener={listener} />
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

const IntegrationListenerControls = ({
  listener,
  variant = 'inline',
}: IntegrationListenerControlsProps) => {
  const { t } = useTranslation();
  const isEnabled = Boolean(listener.settings?.listening.isEnabled);

  if (variant === 'queue') {
    return <QueueListenerControl listener={listener} />;
  }

  return (
    <section className='w-full max-w-3xl rounded-md border border-paper-700 bg-paper-800 p-4 elevated-2'>
      <Stack gap='md'>
        <Group justify='space-between' align='center' gap='md'>
          <div className='min-w-0'>
            <Text fw={700} className='text-paper-50'>
              {t('videoRequests.listener.inlineTitle')}
            </Text>
            <Text size='sm' className='text-dimmed'>
              {t('videoRequests.listener.inlineDescription')}
            </Text>
          </div>
          <Switch
            checked={isEnabled}
            disabled={listener.isLoading || listener.isSaving}
            onChange={(event) => void listener.setListeningEnabled(event.currentTarget.checked)}
            label={t('videoRequests.listener.queueSwitchLabel')}
            aria-label={t('videoRequests.listener.enable')}
          />
        </Group>
        <IntegrationGroupCards listener={listener} />
      </Stack>
    </section>
  );
};

export default IntegrationListenerControls;
