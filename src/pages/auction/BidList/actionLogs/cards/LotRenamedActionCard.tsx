import { Stack, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { focusAuctionLot } from '@pages/auction/actionLogLotFocus';

import ActionLogCard from '../ActionLogCard';
import { ActionLogCardProps } from '../types';

import { LotRenamedActionLogEntry } from './entryTypes';

const LotRenamedActionCard = ({ entry, isReverting, onRevert }: ActionLogCardProps<LotRenamedActionLogEntry>) => {
  const { t } = useTranslation();
  const previousName = entry.previousName || t('actionsLog.emptyValue');
  const nextName = entry.nextName || t('actionsLog.emptyValue');

  return (
    <ActionLogCard
      type={entry.type}
      timestamp={entry.timestamp}
      icon={IconEdit}
      color='violet'
      lotName={entry.nextName || entry.previousName || t('actionsLog.emptyValue')}
      cardTooltip={
        <Stack gap={6}>
          <div>
            <Text size='xs' fw={700} c='dimmed'>
              {t('actionsLog.tooltips.previousLotName')}
            </Text>
            <Text size='sm'>{previousName}</Text>
          </div>
          <div>
            <Text size='xs' fw={700} c='dimmed'>
              {t('actionsLog.tooltips.newLotName')}
            </Text>
            <Text size='sm'>{nextName}</Text>
          </div>
        </Stack>
      }
      isReverting={isReverting}
      onRevert={() => onRevert(entry.id)}
      onMouseEnter={() => focusAuctionLot(entry.lotId)}
      onMouseLeave={() => focusAuctionLot(null)}
    />
  );
};

export default LotRenamedActionCard;
