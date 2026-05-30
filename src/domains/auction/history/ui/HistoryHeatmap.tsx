import { Heatmap } from '@mantine/charts';
import { Chip, Group, Paper, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatCompactNumber, formatShortDate } from '../lib/formatters';
import { buildHeatmapData, type HeatmapMode } from '../lib/statistics';

import type { AuctionHistoryAuction } from '../model/types';

interface HistoryHeatmapProps {
  auctions: AuctionHistoryAuction[];
  endDate: string;
  heatmapMode: HeatmapMode;
  selectedDay: string | null;
  onHeatmapModeChange: (mode: HeatmapMode) => void;
  onDaySelect: (dayKey: string) => void;
}

const heatmapColors = ['#211f32', '#3d2f7d', '#6b46c1', '#11a7a0', '#f2c94c'];
const heatmapModes: HeatmapMode[] = ['auctionCount', 'points', 'donations', 'combined'];
const heatmapGap = 2;
const heatmapWeekdayLabelWidth = 34;
const heatmapRectSize = 16;
const fallbackVisibleWeeks = 52;

const getMondayFirstDayIndex = (date: dayjs.Dayjs): number => {
  const dayIndex = date.day();
  return dayIndex === 0 ? 6 : dayIndex - 1;
};

const getVisibleWeekCount = (availableWidth: number): number => {
  if (!availableWidth) {
    return fallbackVisibleWeeks;
  }

  return Math.max(1, Math.floor((availableWidth - heatmapGap) / (heatmapRectSize + heatmapGap)));
};

const getVisibleStartDate = (endDate: string, visibleWeekCount: number): string => {
  const end = dayjs(endDate);
  const trailingDays = 6 - getMondayFirstDayIndex(end);
  const visibleEnd = end.add(trailingDays, 'day');

  return visibleEnd.subtract(visibleWeekCount * 7 - 1, 'day').format('YYYY-MM-DD');
};

const HistoryHeatmap = ({
  auctions,
  endDate,
  heatmapMode,
  selectedDay,
  onHeatmapModeChange,
  onDaySelect,
}: HistoryHeatmapProps) => {
  const { t } = useTranslation();
  const { ref, width } = useElementSize();
  const heatmapData = useMemo(() => buildHeatmapData(auctions, heatmapMode), [auctions, heatmapMode]);
  const auctionsByDay = useMemo(() => {
    const groupedAuctions = new Map<string, AuctionHistoryAuction[]>();

    auctions.forEach((auction) => {
      const dayKey = auction.startedAt.slice(0, 10);
      groupedAuctions.set(dayKey, [...(groupedAuctions.get(dayKey) ?? []), auction]);
    });

    return groupedAuctions;
  }, [auctions]);
  const availableWidth = Math.max(0, width - heatmapWeekdayLabelWidth - heatmapGap);
  const visibleWeekCount = getVisibleWeekCount(availableWidth);
  const visibleStartDate = getVisibleStartDate(endDate, visibleWeekCount);

  return (
    <Paper withBorder radius='md' p='sm' className='flex flex-col overflow-hidden'>
      <Group justify='space-between' align='flex-start' gap='md'>
        <div>
          <Title order={3} size='h4'>
            {t('auctionHistory.sections.activityHeatmap')}
          </Title>
        </div>
        <Chip.Group value={heatmapMode} onChange={(value) => onHeatmapModeChange(value as HeatmapMode)}>
          <Group gap={6}>
            {heatmapModes.map((mode) => (
              <Chip key={mode} size='xs' value={mode} variant='light'>
                {t(`auctionHistory.heatmap.modes.${mode}`)}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Group>
      <div ref={ref} className='flex min-h-[180px] flex-1 items-center overflow-hidden'>
        <Heatmap
          data={heatmapData}
          startDate={visibleStartDate}
          endDate={endDate}
          colors={heatmapColors}
          domain={[0, Math.max(1, ...Object.values(heatmapData))]}
          rectSize={heatmapRectSize}
          rectRadius={4}
          gap={heatmapGap}
          firstDayOfWeek={1}
          weekdaysLabelsWidth={heatmapWeekdayLabelWidth}
          monthsLabelsHeight={18}
          withMonthLabels
          withWeekdayLabels
          withTooltip
          tooltipProps={{ withinPortal: true }}
          getTooltipLabel={({ date }) => {
            const dayKey = dayjs(date).format('YYYY-MM-DD');
            const dayAuctions = auctionsByDay.get(dayKey) ?? [];
            const points = dayAuctions.reduce((sum, auction) => sum + auction.totalPoints, 0);
            const donationCents = dayAuctions.reduce((sum, auction) => sum + auction.totalDonationCents, 0);
            const bids = dayAuctions.reduce((sum, auction) => sum + auction.participantCount, 0);

            return t('auctionHistory.heatmap.tooltip', {
              date: formatShortDate(dayKey),
              auctions: dayAuctions.length,
              points: formatCompactNumber(points),
              donations: formatCompactMoney(donationCents),
              bids,
            });
          }}
          getRectProps={({ date }) => {
            const dayKey = dayjs(date).format('YYYY-MM-DD');
            const hasAuctions = Boolean(auctionsByDay.get(dayKey)?.length);

            return {
              cursor: hasAuctions ? 'pointer' : 'default',
              opacity: selectedDay === dayKey ? 1 : undefined,
              stroke: selectedDay === dayKey ? '#f2c94c' : undefined,
              strokeWidth: selectedDay === dayKey ? 2 : undefined,
              onClick: () => {
                if (hasAuctions) {
                  onDaySelect(dayKey);
                }
              },
            };
          }}
        />
      </div>
    </Paper>
  );
};

export default HistoryHeatmap;
