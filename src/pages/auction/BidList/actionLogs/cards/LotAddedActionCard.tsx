import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotAddedActionLogEntry } from './entryTypes';

const LotAddedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<LotAddedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconPlus}
      color='green'
      lotName={entry.lot.name || t('actionsLog.emptyValue')}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lot.id)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotAddedActionCard;
