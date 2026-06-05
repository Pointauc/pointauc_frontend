import { IconCash } from '@tabler/icons-react';
import { Trans, useTranslation } from 'react-i18next';

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
      subjectLabel={t('actionsLog.labels.lot')}
      subject={entry.lotName || t('actionsLog.emptyValue')}
      detail={
        <Trans
          i18nKey='actionsLog.details.amountChange'
          values={{
            previous: entry.previousAmount ?? 0,
            next: entry.nextAmount ?? 0,
            delta: Math.sign(entry.amountDelta) >= 0 ? `+${entry.amountDelta}` : entry.amountDelta,
          }}
          components={{
            b: <b />,
          }}
        />
      }
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lotId)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotPriceChangedActionCard;
