import { Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconPhoto, IconPhotoPlus, IconPhotoX } from '@tabler/icons-react';
import { useState, type ClipboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface BackgroundImageModalProps {
  isOpened: boolean;
  onClose: () => void;
  onChange: (image: string) => void;
}

const checkIsImageUrl = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve();
    image.onerror = reject;
  });

const BackgroundImageModal = ({ isOpened, onClose, onChange }: BackgroundImageModalProps) => {
  const { t } = useTranslation();
  const [isCorrectUrl, setIsCorrectUrl] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = (): void => {
    setIsCorrectUrl(true);
    onClose();
  };

  const handleLinkPaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    const imageUrl = event.clipboardData.getData('text');

    setTimeout(() => {
      setIsUploading(true);
      checkIsImageUrl(imageUrl)
        .then(() => {
          onChange(imageUrl);
          handleClose();
        })
        .catch(() => setIsCorrectUrl(false))
        .finally(() => setIsUploading(false));
    }, 170);
  };

  const handleFileUpload = ([file]: File[]): void => {
    const reader = new FileReader();

    reader.onloadend = (): void => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        handleClose();
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <Modal
      opened={isOpened}
      onClose={handleClose}
      zIndex={500}
      size='xl'
      centered
      title={t('settings.auc.backgroundImageModal')}
    >
      <Stack gap='md' align='stretch' justify='center'>
        <Dropzone onDrop={handleFileUpload} maxFiles={1} maxSize={1000 * 1000 * 50} accept={['image/*']}>
          <Group justify='center' gap='xl' mih={120} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconPhotoPlus size={28} />
            </Dropzone.Accept>
            <Dropzone.Idle>
              <IconPhoto size={28} />
            </Dropzone.Idle>
            <Dropzone.Reject>
              <IconPhotoX size={28} />
            </Dropzone.Reject>
            <Text size='lg' inline>
              {t('common.moveFileOrClick')}
            </Text>
          </Group>
        </Dropzone>
        <Text size='xl' ta='center'>
          {t('common.or')}
        </Text>
        <TextInput
          disabled={isUploading}
          onPaste={handleLinkPaste}
          placeholder={t('common.insertImageLink')}
          error={isCorrectUrl ? undefined : t('common.incorrectLink')}
        />
      </Stack>
    </Modal>
  );
};

export default BackgroundImageModal;
