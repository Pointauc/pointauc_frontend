import { IconCash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidUpdatedActionLogEntry } from './entryTypes';

const BidUpdatedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<BidUpdatedActionLogEntry>) => {
  const { t } = useTranslation();
  const amountDelta = entry.nextBid.cost - entry.previousBid.cost;

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconCash}
      color='lime'
      userName={entry.previousBid.username || t('bid.anonymous')}
      detail={t('actionsLog.details.bidCostChange', { previous: entry.previousBid.cost, next: entry.nextBid.cost })}
      priceDelta={amountDelta}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default BidUpdatedActionCard;
