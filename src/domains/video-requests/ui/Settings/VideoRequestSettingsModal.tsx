import { Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface VideoRequestSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

const VideoRequestSettingsModal = ({ opened, onClose }: VideoRequestSettingsModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('videoRequests.settings.title')}
      centered
      classNames={{
        content: 'bg-paper-950 text-paper-50',
        header: 'bg-paper-950 text-paper-50',
        title: 'font-bold',
      }}
    >
      <Stack gap='xs'>
        <Text fw={650} className='text-paper-100'>
          {t('videoRequests.settings.placeholderTitle')}
        </Text>
        <Text size='sm' className='text-dimmed'>
          {t('videoRequests.settings.placeholderDescription')}
        </Text>
      </Stack>
    </Modal>
  );
};

export default VideoRequestSettingsModal;
