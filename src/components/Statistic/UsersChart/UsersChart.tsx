import React, { FC, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Score } from '../../../models/statistic';

Chart.register(...registerables);

interface UsersChartProps {
  scoreboard: Score[];
}

const UsersChart: FC<UsersChartProps> = ({ scoreboard }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      Chart.defaults.color = '#eee';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
      Chart.defaults.font = {
        ...Chart.defaults.font,
        size: 14,
      };

      // eslint-disable-next-line no-new
      new Chart<'bar', Score[]>(chartRef.current, {
        type: 'bar',
        data: {
          datasets: [
            {
              data: scoreboard.slice(0, 7),
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
              ],
              borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: 'Общая сумма ставок',
              font: {
                size: 18,
              },
            },
          },
          parsing: {
            xAxisKey: 'title',
            yAxisKey: 'score',
          },
        },
      });
    }
  }, [scoreboard]);

  return (
    <div className="chart">
      <canvas ref={chartRef} />
    </div>
  );
};

export default UsersChart;
