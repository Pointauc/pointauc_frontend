import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconAlertCircle, IconArrowLeft, IconCheck, IconFileAlert, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsValidSyncPayload } from '@domains/desktop/lib/validateSyncPayload';
import { DesktopSyncDataPayload } from '@domains/desktop/model/types';

export interface SplashFileImportViewProps {
  onFileImport: (payload: DesktopSyncDataPayload) => void;
  onCancel: () => void;
  isImporting?: boolean;
  inModal?: boolean;
}

const readFileText = (file: File): Promise<string> => {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('File read error'));
    reader.readAsText(file);
  });
};

export const SplashFileImportView = ({
  onFileImport,
  onCancel,
  isImporting = false,
  inModal = false,
}: SplashFileImportViewProps) => {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) {
      return;
    }

    setErrorMessage(null);

    try {
      const fileText = await readFileText(selectedFile);
      const parsedData = JSON.parse(fileText);

      if (checkIsValidSyncPayload(parsedData)) {
        onFileImport(parsedData);
      } else {
        setErrorMessage(t('desktop.splash.fileImport.invalidFile'));
      }
    } catch {
      setErrorMessage(t('desktop.splash.fileImport.invalidFile'));
    }
  };

  const content = (
    <Stack gap='md'>
      <div className='text-center mb-2'>
        <Title order={3} className='text-zinc-100 font-bold mb-2'>
          {t('desktop.splash.fileImport.title')}
        </Title>
        <Text size='sm' className='text-zinc-400 max-w-md mx-auto'>
          {t('desktop.splash.fileImport.description')}
        </Text>
      </div>

      {errorMessage && (
        <Alert
          icon={<IconAlertCircle size={18} />}
          color='red'
          variant='light'
          radius='md'
          title={t('desktop.splash.fileImport.invalidFile')}
        >
          {errorMessage}
        </Alert>
      )}

      <Dropzone
        onDrop={handleFileUpload}
        maxFiles={1}
        loading={isImporting}
        className='border-2 border-dashed border-zinc-700 hover:border-violet-600 bg-zinc-950/40 rounded-xl p-8 transition-colors cursor-pointer'
      >
        <Group justify='center' gap='md' mih={120} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <div className='flex flex-col items-center text-teal-400'>
              <IconCheck size={40} />
            </div>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <div className='flex flex-col items-center text-red-400'>
              <IconFileAlert size={40} />
            </div>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <div className='flex flex-col items-center text-zinc-400'>
              <div className='w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-violet-400 mb-3'>
                <IconUpload size={24} />
              </div>
              <Text size='sm' fw={500} className='text-zinc-200 text-center mb-1'>
                {t('desktop.splash.fileImport.dropzonePrompt')}
              </Text>
              <Text size='xs' className='text-zinc-500 text-center'>
                {t('desktop.splash.fileImport.dropzoneSubprompt')}
              </Text>
            </div>
          </Dropzone.Idle>
        </Group>
      </Dropzone>

      <div className='w-full pt-4 border-t border-zinc-800/80 flex justify-center'>
        <Button
          variant='subtle'
          color='gray'
          size='sm'
          onClick={onCancel}
          disabled={isImporting}
          leftSection={<IconArrowLeft size={16} />}
          className='text-zinc-400 hover:text-zinc-200'
        >
          {t('desktop.splash.fileImport.cancel')}
        </Button>
      </div>
    </Stack>
  );

  if (inModal) {
    return <div className='w-full py-2'>{content}</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-xl mx-auto px-4 py-8'>
      <Card withBorder padding='xl' radius='md' className='w-full bg-zinc-900/90 border-zinc-800 shadow-lg'>
        {content}
      </Card>
    </div>
  );
};
