import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Text, Tooltip, Stack, Skeleton } from '@mantine/core';
import { IconCopy, IconExternalLink } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';

import { authControllerGetRoleTokenOptions } from '@api/openapi/@tanstack/react-query.gen';
import { buildOverlayLink } from '@pages/overlays/utils/link';

interface UrlControlsProps {
  overlayId: string;
}

const UrlControls: FC<UrlControlsProps> = ({ overlayId }) => {
  const { t } = useTranslation();

  const tokenLoader = useQuery({
    ...authControllerGetRoleTokenOptions({
      path: { role: 'overlay' },
    }),
  });

  const overlayUrl = tokenLoader.data?.token
    ? buildOverlayLink({ id: overlayId, token: tokenLoader.data.token })
    : null;

  const handleCopyLink = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!overlayUrl) return;

      navigator.clipboard.writeText(overlayUrl);
      notifications.show({
        message: t('common.linkCopied'),
        color: 'green',
      });
    },
    [overlayUrl, t],
  );

  const handleOpenPage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!overlayUrl) return;

      window.open(overlayUrl, '_blank');
    },
    [overlayUrl],
  );

  const isLoading = tokenLoader.isLoading || !overlayUrl;
  const iconSize = 16;

  if (isLoading) {
    return (
      <Group grow gap='xs'>
        <Skeleton height={36} radius='sm' />
        <Skeleton height={36} radius='sm' />
      </Group>
    );
  }

  return (
    <Group grow gap='xs'>
      <Tooltip label={t('overlays.copyLink')}>
        <Button
          variant='light'
          color='blue'
          onClick={handleCopyLink}
          rightSection={<IconCopy size={iconSize} />}
          disabled={isLoading}
        >
          <Text size='xs' fw={600}>
            {t('overlays.copyLink')}
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label={t('overlays.openPage')}>
        <Button
          variant='light'
          color='green'
          onClick={handleOpenPage}
          rightSection={<IconExternalLink size={iconSize} />}
          disabled={isLoading}
        >
          <Text size='xs' fw={600}>
            {t('overlays.openPage')}
          </Text>
        </Button>
      </Tooltip>
    </Group>
  );
};

export default UrlControls;
