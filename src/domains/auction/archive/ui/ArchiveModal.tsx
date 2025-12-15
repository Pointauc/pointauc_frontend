import { Modal } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import ArchiveModalContent from './ArchiveModalContent';

interface ArchiveModalProps {
  opened: boolean;
  onClose: () => void;
}

function ArchiveModal({ opened, onClose }: ArchiveModalProps) {
  const { t } = useTranslation();

  return (
    <Modal opened={opened} onClose={onClose} title={t('archive.modal.title')} size='xl'>
      <ArchiveModalContent />
    </Modal>
  );
}

export default ArchiveModal;
