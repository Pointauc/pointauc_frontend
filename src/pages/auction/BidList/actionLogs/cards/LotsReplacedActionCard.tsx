import { IconExchange } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotsReplacedActionLogEntry } from './entryTypes';

const LotsReplacedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<LotsReplacedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconExchange}
      color='violet'
      subject={t('actionsLog.details.lotsReplaced', {
        previous: entry.previousLots.length,
        next: entry.nextLots.length,
      })}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default LotsReplacedActionCard;
