import { FC, useCallback, useRef } from 'react';
import { Stack, Text, Paper, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import {
  MAX_AUDIO_FILE_SIZE,
  SUPPORTED_AUDIO_TYPES,
} from '@domains/winner-selection/wheel-of-random/settings/lib/soundtrack/constants';

interface FileUploadProps {
  onSelect: (source: Wheel.SoundtrackSourceFile) => void;
}

/**
 * File upload dropzone for local audio files
 * Supports drag-and-drop and click to browse
 */
const FileUpload: FC<FileUploadProps> = ({ onSelect }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
        notifications.show({
          title: t('wheel.soundtrack.errors.invalidFileType'),
          message: t('wheel.soundtrack.errors.invalidFileTypeMessage'),
          color: 'red',
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_AUDIO_FILE_SIZE) {
        notifications.show({
          title: t('wheel.soundtrack.errors.fileTooLarge'),
          message: t('wheel.soundtrack.errors.fileTooLargeMessage', { maxSize: '50MB' }),
          color: 'red',
        });
        return;
      }

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        // Get audio duration
        const audio = new Audio(dataUrl);
        await new Promise<void>((resolve) => {
          audio.addEventListener('loadedmetadata', () => resolve(), { once: true });
        });

        const source: Wheel.SoundtrackSourceFile = {
          type: 'file',
          dataUrl,
          fileName: file.name,
          mimeType: file.type,
          duration: audio.duration,
          fileSize: file.size,
        };

        onSelect(source);
      };

      reader.onerror = () => {
        notifications.show({
          title: t('wheel.soundtrack.errors.loadFailed'),
          message: t('wheel.soundtrack.errors.loadFailedMessage'),
          color: 'red',
        });
      };

      reader.readAsDataURL(file);
    },
    [onSelect, t],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Stack gap='sm'>
      <input
        ref={fileInputRef}
        type='file'
        accept={SUPPORTED_AUDIO_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Paper
        withBorder
        p='xl'
        radius='md'
        style={{
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          textAlign: 'center',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <Group justify='center' gap='xs' mb='xs'>
          <CloudUploadIcon style={{ fontSize: 48, opacity: 0.5 }} />
        </Group>
        <Text size='lg' fw={500} mb='xs'>
          {t('wheel.soundtrack.sourceSelector.fileUpload')}
        </Text>
        <Text size='sm' c='dimmed'>
          {t('wheel.soundtrack.sourceSelector.fileFormats')}
        </Text>
      </Paper>
    </Stack>
  );
};

export default FileUpload;
