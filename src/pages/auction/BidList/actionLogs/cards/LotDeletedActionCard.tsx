import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotDeletedActionLogEntry } from './entryTypes';

const LotDeletedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<LotDeletedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconTrash}
      color='red'
      subjectLabel={t('actionsLog.labels.lot')}
      subject={entry.lot.name || t('actionsLog.emptyValue')}
      detail={t('actionsLog.details.removedLot')}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lot.id)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotDeletedActionCard;
