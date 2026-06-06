import { Stack, Text } from '@mantine/core';
import { IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidProcessedActionLogEntry } from './entryTypes';

const BidProcessedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<BidProcessedActionLogEntry>) => {
  const { t } = useTranslation();
  const affectedLotId = entry.lotChanges[0]?.lotId;
  const username = entry.pendingBid.username || t('bid.anonymous');
  const lotName = entry.lotChanges[0]?.lotName || t('actionsLog.emptyValue');
  const originalMessage = entry.pendingBid.message?.trim() || t('actionsLog.tooltips.emptyBidMessage');

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconTicket}
      color='blue'
      userName={username}
      lotName={lotName}
      cardTooltip={
        <Stack gap={6}>
          <div>
            <Text size='xs' fw={700} c='dimmed'>
              {t('actionsLog.tooltips.originalBidMessage')}
            </Text>
            <Text size='sm'>{originalMessage}</Text>
          </div>
        </Stack>
      }
      detail={<Text className='truncate text-sm'>{originalMessage}</Text>}
      priceDelta={entry.bidLog.cost}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={affectedLotId ? () => focusAuctionLot(affectedLotId) : undefined}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default BidProcessedActionCard;
