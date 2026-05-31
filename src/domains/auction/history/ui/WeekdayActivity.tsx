import { ActionIcon, Paper, Text, Title, Tooltip } from '@mantine/core';
import { IconChartBar, IconPercentage } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { buildWeekdayActivity } from '../lib/statistics';

import type { AuctionHistoryAuction } from '../model/types';

interface WeekdayActivityProps {
  auctions: AuctionHistoryAuction[];
}

type WeekdayBarMode = 'relative' | 'absolute';

const barStyles = [
  'from-cyan-300 to-teal-500',
  'from-indigo-300 to-violet-500',
  'from-fuchsia-300 to-pink-500',
  'from-amber-200 to-yellow-500',
  'from-rose-300 to-orange-500',
  'from-lime-300 to-emerald-500',
  'from-sky-300 to-blue-500',
];

const WeekdayActivity = ({ auctions }: WeekdayActivityProps) => {
  const { t } = useTranslation();
  const [barMode, setBarMode] = useState<WeekdayBarMode>('relative');
  const weekdayActivity = buildWeekdayActivity(auctions);
  const highestPercent = Math.max(1, ...weekdayActivity.map((weekday) => weekday.percent));
  const isRelativeMode = barMode === 'relative';
  const ToggleIcon = isRelativeMode ? IconPercentage : IconChartBar;
  const toggleLabel = t(`auctionHistory.weekdayBarMode.${barMode}.toggleTooltip`);

  const handleToggleBarMode = () => {
    setBarMode((currentMode) => (currentMode === 'relative' ? 'absolute' : 'relative'));
  };

  return (
    <Paper withBorder radius='md' p='sm' className='relative flex min-h-[200px] flex-col'>
      <Title order={3} size='h4' mb='md' pr='xl'>
        {t('auctionHistory.sections.weekdayActivity')}
      </Title>
      <Tooltip label={toggleLabel} withArrow>
        <ActionIcon
          variant='subtle'
          color='gray'
          size='md'
          radius='sm'
          className='absolute top-2 right-2'
          aria-label={toggleLabel}
          onClick={handleToggleBarMode}
        >
          <ToggleIcon size={18} />
        </ActionIcon>
      </Tooltip>
      <div className='grid flex-1 grid-cols-7 items-end gap-1.5'>
        {weekdayActivity.map((weekday, index) => {
          const heightPercent = Math.max(
            3,
            isRelativeMode ? (weekday.percent / highestPercent) * 100 : weekday.percent,
          );

          return (
            <Tooltip
              key={weekday.key}
              label={t('auctionHistory.weekdayTooltip', {
                auctions: weekday.count,
                percent: weekday.percent,
              })}
            >
              <div className='flex h-full min-w-0 flex-col items-center justify-end gap-2'>
                <Text
                  size='xs'
                  fw={700}
                  className='text-dimmed w-full rounded px-1 py-0.5 text-center leading-none shadow-sm'
                >
                  {weekday.percent}%
                </Text>
                <div className='relative flex h-full w-full items-end justify-center rounded-b-md border-b border-white/10 bg-black/10 px-1'>
                  <div
                    className={`w-full max-w-8 rounded-t-lg bg-gradient-to-t shadow-[0_0_18px_rgba(255,255,255,0.12)] ${barStyles[index]}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className='h-full rounded-t-lg bg-white/10' />
                  </div>
                </div>
                <Text size='xs' fw={700} className='w-full truncate text-center'>
                  {t(`auctionHistory.weekdays.${weekday.key}`)}
                </Text>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </Paper>
  );
};

export default WeekdayActivity;
