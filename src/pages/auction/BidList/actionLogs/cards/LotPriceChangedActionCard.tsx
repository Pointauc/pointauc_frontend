import { IconCash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotPriceChangedActionLogEntry } from './entryTypes';

const LotPriceChangedActionCard = ({
  entry,
  isReverting,
  onRevert,
}: ActionLogCardProps<LotPriceChangedActionLogEntry>) => {
  const { t } = useTranslation();

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconCash}
      color='teal'
      lotName={entry.lotName || t('actionsLog.emptyValue')}
      priceDelta={entry.amountDelta}
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lotId)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotPriceChangedActionCard;
