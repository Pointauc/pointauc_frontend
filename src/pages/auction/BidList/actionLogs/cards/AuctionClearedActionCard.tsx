import { IconEraser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { AuctionClearedActionLogEntry } from './entryTypes';

const AuctionClearedActionCard = ({
  entry,
  isReverting,
  onRevert,
}: ActionLogCardProps<AuctionClearedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconEraser}
      color='orange'
      subjectLabel={t('actionsLog.labels.auction')}
      subject={t('actionsLog.details.auctionCleared', {
        lots: entry.previousLots.length,
        bids: entry.previousPurchases.length,
      })}
      detail={t('actionsLog.details.bulkChange')}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default AuctionClearedActionCard;
