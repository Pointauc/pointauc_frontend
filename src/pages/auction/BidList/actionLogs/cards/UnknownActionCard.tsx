import { IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { ActionLogEntry } from './entryTypes';

const UnknownActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<ActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconTicket}
      color='blue'
      subjectLabel={t('actionsLog.labels.action')}
      subject={t('actionsLog.labels.action')}
      detail=''
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default UnknownActionCard;
