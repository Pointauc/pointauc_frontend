import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconTool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { AuctionHistoryDetails } from '../api/AuctionHistoryApi';
import type { AuctionHistoryParticipant } from '../model/types';

interface SelectedAuctionViewProps {
  details: AuctionHistoryDetails;
  participants: AuctionHistoryParticipant[];
  onBack: () => void;
}

const SelectedAuctionView = ({ details: _details, participants: _participants, onBack }: SelectedAuctionViewProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap='md'>
      <Button
        variant='subtle'
        color='gray'
        size='xs'
        leftSection={<IconArrowLeft size={14} />}
        onClick={onBack}
        className='w-fit'
      >
        {t('auctionHistory.actions.backToList')}
      </Button>

      <Paper withBorder radius='md' p='xl' className='border-white/10 bg-white/[0.035]'>
        <Stack gap='md' align='center' className='py-8 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-md bg-yellow-400/10 text-yellow-300'>
            <IconTool size={28} />
          </div>
          <Stack gap={6} align='center'>
            <Title order={2}>{t('auctionHistory.selectedAuction.placeholderTitle')}</Title>
            <Text c='dimmed' maw={420}>
              {t('auctionHistory.selectedAuction.placeholderDescription')}
            </Text>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default SelectedAuctionView;
