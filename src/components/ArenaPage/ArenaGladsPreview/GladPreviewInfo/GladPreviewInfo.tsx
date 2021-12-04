import React, { FC } from 'react';
import PersonIcon from '@material-ui/icons/Person';
import { Typography } from '@material-ui/core';
import { GladType, StatType } from '../../../../models/Arena/Glad';

interface GladPreviewInfoProps {
  glad: GladType;
}

const statNames: Record<StatType | 'hp', string> = {
  [StatType.atk]: 'atk',
  [StatType.def]: 'def',
  [StatType.agi]: 'agi',
  hp: 'hp',
};

const visibleStats: (StatType | 'hp')[] = [...Object.values(StatType), 'hp'];

const GladPreviewInfo: FC<GladPreviewInfoProps> = ({ glad }) => {
  return (
    <div className="glad-preview">
      <PersonIcon className="glad-preview-portrait" />
      <div className="glad-preview-stat-list">
        <Typography className="glad-preview-name">{glad.slot.name}</Typography>
        {visibleStats.map((stat) => (
          <Typography key={stat} className="glad-preview-stat">
            {`${statNames[stat]}: ${glad[stat]}`}
          </Typography>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GladPreviewInfo, ({ glad: a }, { glad: b }) =>
  visibleStats.every((stat) => a[stat] === b[stat]),
);
