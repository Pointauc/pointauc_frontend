import { Button, Group, Pagination, Paper, Stack, Text, Title } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { formatDate, getPreviousDateKey, toDateKey } from '../lib/formatters';

import AuctionHistoryCard from './AuctionHistoryCard';

import type { AuctionCardSummary } from '../lib/statistics';

interface LotsListProps {
  dateRange: [string | null, string | null];
  selectedDay: string | null;
  visibleSummaries: AuctionCardSummary[];
  totalPages: number;
  page: number;
  onDateRangeChange: (value: [string | null, string | null]) => void;
  onPageChange: (page: number) => void;
  onClearDayFilter: () => void;
  onSelectAuction: (auctionId: string) => void;
  onDeleteAuction: (auctionId: string) => void;
  onRestoreAuction: (auctionId: string) => Promise<void>;
  isCurrentAuctionEmpty: boolean;
  deletingAuctionId: string | null;
  restoringAuctionId: string | null;
}

const LotsList = ({
  dateRange,
  selectedDay,
  visibleSummaries,
  totalPages,
  page,
  onDateRangeChange,
  onPageChange,
  onClearDayFilter,
  onSelectAuction,
  onDeleteAuction,
  onRestoreAuction,
  isCurrentAuctionEmpty,
  deletingAuctionId,
  restoringAuctionId,
}: LotsListProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap='sm'>
      <Group justify='space-between'>
        <div>
          <Title order={2} size='h3'>
            {t('auctionHistory.sections.previousAuctions')}
          </Title>
          {selectedDay && (
            <Text size='sm' c='dimmed'>
              {t('auctionHistory.filters.filteredByDay', { date: formatDate(selectedDay) })}
            </Text>
          )}
        </div>
        <Group gap='sm' align='flex-end'>
          <DatePickerInput
            type='range'
            value={dateRange}
            onChange={onDateRangeChange}
            presets={[
              { value: [getPreviousDateKey(30), toDateKey(new Date())], label: t('auctionHistory.filters.last30Days') },
              { value: [getPreviousDateKey(90), toDateKey(new Date())], label: t('auctionHistory.filters.last90Days') },
            ]}
            clearable={false}
            className='w-72'
          />
          {selectedDay && (
            <Button variant='light' color='gray' leftSection={<IconX size={16} />} onClick={onClearDayFilter}>
              {t('auctionHistory.actions.clearDayFilter')}
            </Button>
          )}
        </Group>
      </Group>
      {visibleSummaries.length === 0 ? (
        <Paper withBorder radius='md' p='xl' className='border-white/10 bg-white/[0.03]'>
          <Text c='dimmed'>{t('auctionHistory.empty.noAuctions')}</Text>
        </Paper>
      ) : (
        visibleSummaries.map((summary) => (
          <AuctionHistoryCard
            key={summary.auction.id}
            summary={summary}
            isCurrentAuctionEmpty={isCurrentAuctionEmpty}
            isDeleting={deletingAuctionId === summary.auction.id}
            isRestoring={restoringAuctionId === summary.auction.id}
            onSelect={onSelectAuction}
            onDelete={onDeleteAuction}
            onRestore={onRestoreAuction}
          />
        ))
      )}
      <Pagination total={totalPages} value={page} onChange={onPageChange} />
    </Stack>
  );
};

export default LotsList;
