import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Chart, ChartDataset, registerables, TooltipItem } from 'chart.js';
import dayjs from 'dayjs';
import { PurchaseLog } from '../../../reducers/Purchases/Purchases';
import { TimeScore } from '../../../models/statistic';
import { getRandomIntInclusive } from '../../../utils/common.utils';
import { FORMAT } from '../../../constants/format.constants';
import { COLORS } from '../../../constants/color.constants';
import { store } from '../../../index';

Chart.register(...registerables);

interface SlotsChartProps {
  slotsMap: Map<string, PurchaseLog[]>;
}

const SlotsChart: FC<SlotsChartProps> = ({ slotsMap }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  const datasets: ChartDataset<'scatter', TimeScore[]>[] = useMemo(() => {
    const { slots } = store.getState().slots;
    const { history } = store.getState().purchases;
    const topSlots = slots.slice(0, 5).reduce<PurchaseLog[][]>((accum, { name }) => {
      const bids = slotsMap.get(name || '');

      return bids ? [...accum, bids] : accum;
    }, []);
    const topSlotsIds = slots.slice(0, 5).map(({ id }) => id);

    const lastTimestamp =
      [...history].reverse().find(({ target }) => topSlotsIds.includes(target || ''))?.timestamp || '';

    return topSlots.map<ChartDataset<'scatter', TimeScore[]>>((bids, index) => {
      let previousCost = 0;

      const data = bids.map<TimeScore>(({ timestamp, cost }) => {
        previousCost = cost + previousCost;

        return { timestamp: dayjs(timestamp).valueOf(), score: previousCost };
      });

      return {
        data: [...data, { timestamp: dayjs(lastTimestamp).valueOf(), score: previousCost }],
        label: slots[index].name || '',
        borderColor: COLORS.WHEEL[getRandomIntInclusive(0, COLORS.WHEEL.length)],
        showLine: true,
        pointBorderColor: 'transparent',
        pointBackgroundColor: 'transparent',
      };
    });
  }, [slotsMap]);

  useEffect(() => {
    if (chartRef.current) {
      Chart.defaults.color = '#eee';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
      Chart.defaults.font = {
        ...Chart.defaults.font,
        size: 14,
      };

      // eslint-disable-next-line no-new
      new Chart<'scatter', TimeScore[]>(chartRef.current, {
        type: 'scatter',
        data: {
          datasets,
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Изменение суммы лота во времени',
              font: {
                size: 18,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx: TooltipItem<'scatter'>): string =>
                  `(${dayjs(ctx.parsed.x).format(FORMAT.DATE.time)}, ${ctx.parsed.y})`,
              },
            },
          },
          scales: {
            x: {
              ticks: {
                callback: (value): string => dayjs(value).format(FORMAT.DATE.time),
              },
            },
          },
          parsing: {
            xAxisKey: 'timestamp',
            yAxisKey: 'score',
          },
        },
      });
    }
  }, [datasets]);

  return (
    <div className="chart">
      <canvas ref={chartRef} />
    </div>
  );
};

export default SlotsChart;
