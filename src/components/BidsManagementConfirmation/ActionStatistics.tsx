import { useMemo } from 'react';
import { Divider, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { PurchaseLog } from '@reducers/Purchases/Purchases.ts';
import array from '@utils/dataType/array.ts';
import { COLORS } from '@constants/color.constants.ts';

interface ActionStatisticsProps {
  data: PurchaseLog[];
}

function ActionStatistics({ data }: ActionStatisticsProps) {
  const { t } = useTranslation();
  const totalCost = useMemo(() => data.reduce((acc, cur) => acc + cur.cost, 0), [data]);
  const viewersContribution = useMemo(() => {
    return data.reduce<Record<string, number>>((acc, cur) => {
      if (acc[cur.username]) {
        acc[cur.username] += cur.cost;
      } else {
        acc[cur.username] = cur.cost;
      }

      return acc;
    }, {});
  }, [data]);

  const mostValuableViewer = useMemo(
    () => array.maxBy([...Object.entries(viewersContribution)], ([, cost]) => cost) ?? [],
    [viewersContribution],
  );

  const viewerColor = useMemo(() => COLORS.TWITCH_VIEWER[Math.floor(Math.random() * COLORS.TWITCH_VIEWER.length)], []);

  if (!data.length) {
    return <Text>{t('bidsManagement.statistic.noBids')}</Text>;
  }

  return (
    <Group gap='md'>
      <Group gap='xs'>
        <Text c='dimmed'>{t('bidsManagement.statistic.bidsAmount')}</Text>
        <Text fw={500}>{data.length}</Text>
      </Group>
      <Divider orientation='vertical' />
      <Group gap='xs'>
        <Text c='dimmed'>{t('bidsManagement.statistic.totalCost')}</Text>
        <Text fw={500}>{totalCost}</Text>
      </Group>
      <Divider orientation='vertical' />
      <Group gap='xs'>
        <Text c='dimmed'>{t('bidsManagement.statistic.largestInvestor')}</Text>
        <div
          dangerouslySetInnerHTML={{
            __html: t('bidsManagement.statistic.investorAmount', {
              name: mostValuableViewer[0],
              amount: mostValuableViewer[1],
              color: viewerColor,
            }),
          }}
        />
      </Group>
    </Group>
  );
}

export default ActionStatistics;
