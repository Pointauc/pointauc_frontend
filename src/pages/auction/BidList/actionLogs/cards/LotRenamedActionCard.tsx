import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotRenamedActionLogEntry } from './entryTypes';

const LotRenamedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<LotRenamedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconEdit}
      color='violet'
      subjectLabel={t('actionsLog.labels.lot')}
      subject={entry.nextName || entry.previousName || t('actionsLog.emptyValue')}
      detail={t('actionsLog.details.lotNameChange', {
        previous: entry.previousName || t('actionsLog.emptyValue'),
        next: entry.nextName || t('actionsLog.emptyValue'),
      })}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lotId)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotRenamedActionCard;
