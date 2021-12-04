import React, { FC } from 'react';
import { Divider, LinearProgress } from '@material-ui/core';
import classNames from 'classnames';
import { GladType } from '../../../../models/Arena/Glad';

interface ArenaSlotChartInfoProps {
  glad: GladType;
  maxValue: number;
  isSelected: boolean;
  isCandidate: boolean;
  onSelect: (glad: GladType) => void;
}

const ArenaSlotChartInfo: FC<ArenaSlotChartInfoProps> = ({ glad, maxValue, isSelected, isCandidate, onSelect }) => {
  const handleSelect = (): void => {
    console.log('select');
    onSelect(glad);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
    <div
      role="button"
      className={classNames('arena-chart-item', { selected: isSelected, candidate: isCandidate })}
      onClick={handleSelect}
    >
      <div className="arena-chart-item-wrapper">
        <div className="arena-chart-item-name">{glad.slot.name}</div>
        <LinearProgress variant="determinate" value={((glad.stat || 0) / maxValue) * 100} />
        <Divider />
      </div>
    </div>
  );
};

export default React.memo(ArenaSlotChartInfo);
