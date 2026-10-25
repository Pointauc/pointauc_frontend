import { Badge, Group, Modal, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { DesktopSyncModalContent } from '@domains/desktop/ui/DesktopSyncModal/DesktopSyncModalContent';

export interface DesktopSyncModalProps {
  opened: boolean;
  onClose: () => void;
}

export const DesktopSyncModal = ({ opened, onClose }: DesktopSyncModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size='lg'
      title={
        <Group gap='xs' align='center'>
          <Text fw={700} size='md'>
            {t('desktop.syncModal.title')}
          </Text>
          <Badge size='sm' variant='light' color='violet'>
            {t('desktop.syncModal.badge')}
          </Badge>
        </Group>
      }
    >
      <DesktopSyncModalContent onClose={onClose} />
    </Modal>
  );
};

export default DesktopSyncModal;
