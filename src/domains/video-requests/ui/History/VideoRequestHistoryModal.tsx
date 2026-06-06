import { Button, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { VideoRequestHistoryRecord } from '@domains/video-requests/model/types';
import VideoRequestCard from '@domains/video-requests/ui/Queue/VideoRequestCard';

interface VideoRequestHistoryModalProps {
  opened: boolean;
  history: VideoRequestHistoryRecord[];
  isClearing: boolean;
  onClose: () => void;
  onClear: () => void;
}

const VideoRequestHistoryModal = ({
  opened,
  history,
  isClearing,
  onClose,
  onClear,
}: VideoRequestHistoryModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('videoRequests.history.title')}
      size='lg'
      centered
      classNames={{
        content: 'bg-paper-950 text-paper-50',
        header: 'bg-paper-950 text-paper-50',
        title: 'font-bold',
      }}
    >
      <Stack gap='md'>
        {history.length === 0 ? (
          <div className='rounded-md border border-dashed border-paper-800 p-6 text-center'>
            <Text fw={650} className='text-paper-100'>
              {t('videoRequests.history.emptyTitle')}
            </Text>
            <Text size='sm' className='mt-1 text-dimmed'>
              {t('videoRequests.history.emptyDescription')}
            </Text>
          </div>
        ) : (
          <ScrollArea h={420}>
            <Stack gap='sm' pr='sm'>
              {history.map((request) => (
                <VideoRequestCard key={`${request.id}-${request.completedAt}`} request={request} showStatus />
              ))}
            </Stack>
          </ScrollArea>
        )}

        <Button
          variant='light'
          color='red'
          leftSection={<IconTrash size={16} />}
          disabled={history.length === 0}
          loading={isClearing}
          onClick={onClear}
        >
          {t('videoRequests.history.clear')}
        </Button>
      </Stack>
    </Modal>
  );
};

export default VideoRequestHistoryModal;
