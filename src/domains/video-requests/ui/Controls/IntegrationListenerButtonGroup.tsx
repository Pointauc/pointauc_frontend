import { Button, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import { useIntegrationsController } from '@domains/bids/external-integrations/shared/useIntegrationsController';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import { VideoRequestBidGroup } from '@domains/video-requests/model/types';
import PointsIcon from '@assets/icons/channelPoints.svg?react';

interface IntegrationListenerButtonGroupProps {
  listener: ReturnType<typeof useVideoRequestListener>;
  variant?: 'inline' | 'queue';
}

const IntegrationListenerButtonGroup = ({ listener, variant = 'inline' }: IntegrationListenerButtonGroupProps) => {
  const { t } = useTranslation();
  const [pendingGroup, setPendingGroup] = useState<VideoRequestBidGroup | null>(null);
  const donationsController = useIntegrationsController(listener.availableIntegrationsByGroup.donations);
  const channelPointsController = useIntegrationsController(listener.availableIntegrationsByGroup.channelPoints);
  const activeBidGroups = listener.settings?.listening.activeBidGroups ?? [];
  const isCompact = variant === 'queue';
  // const isDisabled = listener.isLoading || listener.isSaving;

  const groupControllers = {
    donations: donationsController,
    channelPoints: channelPointsController,
  };

  const toggleGroup = async (group: VideoRequestBidGroup, isEnabled: boolean) => {
    setPendingGroup(group);

    try {
      await listener.toggleBidGroup(group, isEnabled);
    } finally {
      setPendingGroup(null);
    }
  };

  return (
    <Button.Group className={clsx(isCompact ? 'shrink-0' : 'w-fit')}>
      {(['donations', 'channelPoints'] as const).map((group) => {
        const controller = groupControllers[group];
        const isEnabled = activeBidGroups.includes(group);
        const isLoading = pendingGroup === group || controller.isAnyLoading;
        const tooltipLabel = t(
          isEnabled
            ? `videoRequests.listener.tooltips.disable.${group}`
            : `videoRequests.listener.tooltips.enable.${group}`,
        );

        return (
          <Tooltip key={group} label={tooltipLabel} withArrow>
            <Button
              aria-label={tooltipLabel}
              size={isCompact ? 'xs' : 'sm'}
              px={isCompact ? 'xs' : 'sm'}
              variant={'light'}
              color={isEnabled || isLoading ? 'primary' : 'black'}
              radius='lg'
              className={clsx(
                'min-w-10',
                isEnabled || isLoading ? 'text-primary-300' : 'text-paper-50 bg-black hover:bg-black/50',
                isCompact && 'h-8',
              )}
              loading={isLoading}
              onClick={() => void toggleGroup(group, !isEnabled)}
            >
              {group === 'donations' ? (
                <span className='text-base leading-none font-bold'>{t('common.currencySign')}</span>
              ) : (
                <PointsIcon width={18} height={18} />
              )}
            </Button>
          </Tooltip>
        );
      })}
    </Button.Group>
  );
};

export default IntegrationListenerButtonGroup;
