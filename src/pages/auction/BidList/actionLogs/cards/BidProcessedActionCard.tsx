import { IconTicket } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidProcessedActionLogEntry } from './entryTypes';

const BidProcessedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<BidProcessedActionLogEntry>) => {
  const { t } = useTranslation();
  const affectedLotId = entry.lotChanges[0]?.lotId;

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconTicket}
      color='blue'
      subjectLabel={t('actionsLog.labels.user')}
      subject={entry.pendingBid.username || t('bid.anonymous')}
      detail={
        <Trans
          i18nKey='actionsLog.details.bidTarget'
          values={{
            target: entry.lotChanges[0]?.lotName || t('actionsLog.emptyValue'),
            cost: Math.sign(entry.bidLog.cost) >= 0 ? `+${entry.bidLog.cost}` : entry.bidLog.cost,
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

export default BidProcessedActionCard;
