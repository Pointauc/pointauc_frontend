import { IconTrash } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';


import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidDeletedActionLogEntry } from './entryTypes';

const BidDeletedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<BidDeletedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconTrash}
      color='pink'
      subjectLabel={t('actionsLog.labels.user')}
      subject={entry.pendingBid.username || t('bid.anonymous')}
      detail={
        <Trans
          i18nKey='actionsLog.details.removedBid'
          components={{
            b: <b />,
          }}
        />
      }
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default BidDeletedActionCard;
