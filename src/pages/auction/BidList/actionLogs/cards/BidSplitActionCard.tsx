import { IconArrowsSplit } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidSplitActionLogEntry } from './entryTypes';

const BidSplitActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<BidSplitActionLogEntry>) => {
  const { t } = useTranslation();
  const affectedLotId = entry.lotChanges[0]?.lotId;

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconArrowsSplit}
      color='grape'
      userName={entry.pendingBid.username || t('bid.anonymous')}
      lotName={entry.lotChanges[0]?.lotName || t('actionsLog.emptyValue')}
      detail={
        <Trans
          i18nKey='actionsLog.details.splitCount'
          values={{
            count: entry.bidLogs.length,
          }}
          components={{
            b: <b />,
          }}
        />
      }
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={affectedLotId ? () => focusAuctionLot(affectedLotId) : undefined}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default BidSplitActionCard;
