import { Paper, Text, Title, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { buildWeekdayActivity } from '../lib/statistics';

import type { AuctionHistoryAuction } from '../model/types';

interface WeekdayActivityProps {
  auctions: AuctionHistoryAuction[];
}

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
  const weekdayActivity = buildWeekdayActivity(auctions);
  const highestPercent = Math.max(1, ...weekdayActivity.map((weekday) => weekday.percent));

  return (
    <Paper withBorder radius='md' p='sm' className='flex flex-col'>
      <Title order={3} size='h4' mb='md'>
        {t('auctionHistory.sections.weekdayActivity')}
      </Title>
      <div className='grid flex-1 grid-cols-7 items-end gap-1.5'>
        {weekdayActivity.map((weekday, index) => {
          const heightPercent = Math.max(8, (weekday.percent / highestPercent) * 100);

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
