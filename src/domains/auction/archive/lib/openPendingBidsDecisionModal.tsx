import { Button, SimpleGrid, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import i18next from 'i18next';

interface OpenPendingBidsDecisionModalProps {
  pendingBidsCount: number;
  onExclude: () => void;
  onInclude: () => void;
}

const openPendingBidsDecisionModal = ({
  pendingBidsCount,
  onExclude,
  onInclude,
}: OpenPendingBidsDecisionModalProps) => {
  const modalId = modals.open({
    title: i18next.t('archive.pendingBidsPrompt.title'),
    centered: true,
    size: '32em',
    children: (
      <Stack gap='md'>
        <Text size='sm'>{i18next.t('archive.pendingBidsPrompt.description', { count: pendingBidsCount })}</Text>

        <SimpleGrid cols={2} spacing='xs'>
          <Button
            variant='outline'
            onClick={() => {
              modals.close(modalId);
              onExclude();
            }}
          >
            {i18next.t('archive.pendingBidsPrompt.excludeButton')}
          </Button>
          <Button
            onClick={() => {
              modals.close(modalId);
              onInclude();
            }}
          >
            {i18next.t('archive.pendingBidsPrompt.includeButton')}
          </Button>
        </SimpleGrid>
      </Stack>
    ),
  });
};

export default openPendingBidsDecisionModal;
