import { Badge, Checkbox, Group, Popover, Stack, Text } from '@mantine/core';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import { IconSize } from '@models/integration';
import {
  IntegrationStatusCardHeader,
  IntegrationStatusCardRoot,
} from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';

import type { VideoRequestBidGroup } from '@domains/video-requests/model/types';
import type { IntegrationStatusCardStatus } from '@shared/ui/IntegrationStatusCard/IntegrationStatusCard';

interface IntegrationListenerControlsProps {
  listener: ReturnType<typeof useVideoRequestListener>;
  variant?: 'inline' | 'queue';
}

const BID_GROUPS: VideoRequestBidGroup[] = ['donations', 'channelPoints'];

const getListenerStatus = (listener: ReturnType<typeof useVideoRequestListener>): IntegrationStatusCardStatus => {
  if (
    listener.isLoading ||
    listener.isSaving ||
    Object.values(listener.subscriptions).some((subscription) => subscription?.loading)
  ) {
    return 'loading';
  }

  return listener.settings?.listening.isEnabled ? 'enabled' : 'disabled';
};

const getActiveListeningIntegrations = (listener: ReturnType<typeof useVideoRequestListener>) => {
  const activeBidGroups = listener.settings?.listening.activeBidGroups ?? BID_GROUPS;

  return activeBidGroups.flatMap((group) => listener.availableIntegrationsByGroup[group]);
};

const ListenerStatusIcons = ({ listener }: Pick<IntegrationListenerControlsProps, 'listener'>) => {
  const activeIntegrations = getActiveListeningIntegrations(listener);

  if (activeIntegrations.length === 0) {
    return null;
  }

  return (
    <div className='flex items-center gap-1.5'>
      {activeIntegrations.map((integration) => {
        const Icon = integration.branding.icon;
        const subscription = listener.subscriptions[integration.id];
        const status = subscription?.loading ? 'loading' : subscription?.subscribed ? 'enabled' : 'disabled';

        return (
          <span
            key={integration.id}
            className={
              status === 'enabled'
                ? 'text-white'
                : status === 'loading'
                ? 'text-sky-200'
                : 'text-slate-500 opacity-60'
            }
            data-status={status}
          >
            <Icon size={IconSize.SMALL} classes='max-h-4 max-w-4' />
          </span>
        );
      })}
    </div>
  );
};

const ListenerCard = ({
  listener,
  variant,
}: Pick<IntegrationListenerControlsProps, 'listener'> & { variant: 'inline' | 'queue' }) => {
  const { t } = useTranslation();
  const isEnabled = Boolean(listener.settings?.listening.isEnabled);
  const status = getListenerStatus(listener);
  const isDisabled = listener.isLoading || listener.isSaving;

  return (
    <IntegrationStatusCardRoot
      status={status}
      isInteractive={!isDisabled}
      isPressed={isEnabled}
      ariaLabel={t('videoRequests.listener.enable')}
      className={variant === 'queue' ? 'min-w-[13rem]' : undefined}
      onClick={isDisabled ? undefined : () => void listener.setListeningEnabled(!isEnabled)}
    >
      <IntegrationStatusCardHeader
        status={status}
        className={variant === 'queue' ? 'min-h-10 px-3' : undefined}
        title={
          <div className='flex min-w-0 items-center justify-between gap-3'>
            <div className='min-w-0'>
              <Text fw={650} size='sm' truncate>
                {t('videoRequests.listener.queueSwitchLabel')}
              </Text>
              {variant === 'inline' ? (
                <Text size='xs' className='text-dimmed truncate'>
                  {t('videoRequests.listener.inlineDescription')}
                </Text>
              ) : null}
            </div>
            <ListenerStatusIcons listener={listener} />
          </div>
        }
      />
    </IntegrationStatusCardRoot>
  );
};

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
            className='border-paper-700 bg-paper-950 hover:border-paper-500 data-[checked=true]:border-primary-500 data-[checked=true]:bg-primary-light p-3 transition-colors'
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
                  <Text size='xs' className='text-dimmed mt-1'>
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
                          <Text size='xs' className='text-paper-200 truncate'>
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
          <ListenerCard listener={listener} variant='queue' />
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

const IntegrationListenerControls = ({ listener, variant = 'inline' }: IntegrationListenerControlsProps) => {
  const { t } = useTranslation();
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

  if (variant === 'queue') {
    return <QueueListenerControl listener={listener} />;
  }

  return (
    <section className='bg-paper-900 elevated-3 w-full max-w-3xl rounded-md p-4'>
      <Stack gap='sm'>
        <Text fw={700}>{t('videoRequests.listener.inlineTitle')}</Text>
        <Popover opened={isPopoverOpen} width={350} position='bottom-start' withArrow shadow='lg'>
          <Popover.Target>
            <div onMouseEnter={openPopover} onMouseLeave={scheduleClose}>
              <ListenerCard listener={listener} variant='inline' />
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
      </Stack>
    </section>
  );
};

export default IntegrationListenerControls;
