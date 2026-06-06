import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { BidRedemptionStatusChangedActionLogEntry } from './entryTypes';

const BidRedemptionStatusChangedActionCard = ({
  entry,
  isReverting,
  onRevert,
}: ActionLogCardProps<BidRedemptionStatusChangedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconCircleCheck}
      color='indigo'
      subjectLabel={t('actionsLog.labels.rewards')}
      subject={t('actionsLog.details.redemptionStatusChanged', { count: entry.bidIds.length })}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
    />
  );
};

export default BidRedemptionStatusChangedActionCard;
