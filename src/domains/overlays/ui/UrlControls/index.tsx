import { Alert, Button, Group, Modal, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCopy, IconExternalLink } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authControllerGetRoleTokenOptions } from '@api/openapi/@tanstack/react-query.gen';

import { buildOverlayLink } from '../../lib/link';

interface UrlControlsProps {
  overlayId: string;
}

const OVERLAY_WARNING_SHOWN_KEY = 'overlaySecurityWarningShown';

const UrlControls: FC<UrlControlsProps> = ({ overlayId }) => {
  const { t } = useTranslation();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const tokenLoader = useQuery({
    ...authControllerGetRoleTokenOptions({
      path: { role: 'overlay' },
    }),
  });

  const overlayUrl = tokenLoader.data?.token
    ? buildOverlayLink({ id: overlayId, token: tokenLoader.data.token })
    : null;

  const checkWarningAndExecute = useCallback((callback: () => void) => {
    const hasSeenWarning = localStorage.getItem(OVERLAY_WARNING_SHOWN_KEY);

    if (!hasSeenWarning) {
      setIsWarningModalOpen(true);
      // Store the callback to execute after warning is confirmed
      (window as any).__pendingOverlayAction = callback;
    } else {
      callback();
    }
  }, []);

  const handleWarningConfirm = useCallback(() => {
    localStorage.setItem(OVERLAY_WARNING_SHOWN_KEY, 'true');
    setIsWarningModalOpen(false);

    // Execute the pending action if any
    const pendingAction = (window as any).__pendingOverlayAction;
    if (pendingAction) {
      pendingAction();
      delete (window as any).__pendingOverlayAction;
    }
  }, []);

  const handleCopyLink = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!overlayUrl) return;

      checkWarningAndExecute(() => {
        navigator.clipboard.writeText(overlayUrl);
        notifications.show({
          message: t('common.linkCopied'),
          color: 'green',
        });
      });
    },
    [overlayUrl, t, checkWarningAndExecute],
  );

  const handleOpenPage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!overlayUrl) return;

      checkWarningAndExecute(() => {
        window.open(overlayUrl, '_blank');
      });
    },
    [overlayUrl, checkWarningAndExecute],
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
    <>
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

      <Modal
        opened={isWarningModalOpen}
        onClick={(e) => e.stopPropagation()}
        onClose={() => setIsWarningModalOpen(false)}
        title={t('overlays.securityWarning.title')}
        centered
        size='lg'
      >
        <Stack gap='md'>
          <Alert icon={<IconAlertTriangle size={20} />} color='red' variant='light'>
            <Text fw={600}>{t('overlays.securityWarning.description')}</Text>
          </Alert>

          <Stack gap='xs'>
            <Text fw={600}>{t('overlays.securityWarning.issues')}</Text>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              <li>
                <Text size='sm'>{t('overlays.securityWarning.issue1')}</Text>
              </li>
              <li>
                <Text size='sm'>{t('overlays.securityWarning.issue2')}</Text>
              </li>
              <li>
                <Text size='sm'>{t('overlays.securityWarning.issue3')}</Text>
              </li>
            </ul>
          </Stack>

          <Text size='sm' c='dimmed' fs='italic'>
            {t('overlays.securityWarning.noShowAgain')}
          </Text>

          <Button onClick={handleWarningConfirm} color='red' fullWidth>
            {t('overlays.securityWarning.confirm')}
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default UrlControls;
