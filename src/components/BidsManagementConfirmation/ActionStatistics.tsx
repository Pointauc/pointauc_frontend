import React, { useMemo } from 'react';
import { Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { PurchaseLog } from '@reducers/Purchases/Purchases.ts';
import array from '@utils/dataType/array.ts';
import { COLORS } from '@constants/color.constants.ts';

interface ActionStatisticsProps {
  data: PurchaseLog[];
}

const ActionStatistics = ({ data }: ActionStatisticsProps) => {
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
    () => array.maxBy([...Object.entries(viewersContribution)], ([username, cost]) => cost) ?? [],
    [viewersContribution],
  );

  const viewerColor = useMemo(() => COLORS.TWITCH_VIEWER[Math.floor(Math.random() * COLORS.TWITCH_VIEWER.length)], []);

  if (!data.length) {
    return <Typography>{t('bidsManagement.statistic.noBids')}</Typography>;
  }

  return (
    <Stack direction='row' spacing={3}>
      <div dangerouslySetInnerHTML={{ __html: t('bidsManagement.statistic.bidsAmount', { amount: data.length }) }} />
      <Divider flexItem orientation='vertical' />
      <div dangerouslySetInnerHTML={{ __html: t('bidsManagement.statistic.totalCost', { amount: totalCost }) }} />
      <Divider flexItem orientation='vertical' />
      <div
        dangerouslySetInnerHTML={{
          __html: t('bidsManagement.statistic.largestInvestor', {
            name: mostValuableViewer[0],
            amount: mostValuableViewer[1],
            color: viewerColor,
          }),
        }}
      />
    </Stack>
  );
};

export default ActionStatistics;
