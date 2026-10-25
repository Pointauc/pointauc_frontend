import { Badge, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import i18next from 'i18next';

import DesktopDownloadModalContent from '@domains/desktop/ui/DesktopDownloadModal/DesktopDownloadModalContent';

export const DESKTOP_DOWNLOAD_MODAL_ID = 'desktop-download-modal';

export const openDesktopDownloadModal = () => {
  modals.open({
    modalId: DESKTOP_DOWNLOAD_MODAL_ID,
    title: (
      <Group gap='xs' align='center'>
        <Text fw={700} size='md'>
          {i18next.t('desktop.downloadModal.title')}
        </Text>
        <Badge size='sm' variant='light' color='blue'>
          {i18next.t('desktop.downloadModal.betaBadge')}
        </Badge>
      </Group>
    ),
    centered: true,
    size: 'lg',
    children: <DesktopDownloadModalContent />,
  });
};
