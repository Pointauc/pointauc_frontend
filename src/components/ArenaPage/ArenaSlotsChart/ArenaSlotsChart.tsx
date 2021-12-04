import React, { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';
import ArenaSlotChartInfo from './ArenaSlotChartInfo/ArenaSlotChartInfo';
import { GladType } from '../../../models/Arena/Glad';

interface ArenaSlotsChartProps {
  glads: GladType[];
  candidates: GladType[];
  selectedGlads: GladType[];
  setSelectedGlads: Dispatch<SetStateAction<GladType[]>>;
}

const ArenaSlotsChart: FC<ArenaSlotsChartProps> = ({ glads, candidates, selectedGlads, setSelectedGlads }) => {
  const gladMaxStat = useMemo(() => (glads[0] && glads[0].stat) || 0, [glads]);

  const selectGlad = useCallback(
    (glad: GladType) => {
      setSelectedGlads((prev) => {
        const index = prev.findIndex(({ id }) => glad.id === id);

        if (index === -1) {
          return [...prev, glad];
        }
        const copy = [...prev];

        copy.splice(index, 1);

        return copy;
      });
    },
    [setSelectedGlads],
  );

  return (
    <div>
      {glads.map((slot) => (
        <ArenaSlotChartInfo
          key={slot.id}
          glad={slot}
          maxValue={gladMaxStat}
          isSelected={selectedGlads.includes(slot)}
          isCandidate={candidates.includes(slot)}
          onSelect={selectGlad}
        />
      ))}
    </div>
  );
};

export default ArenaSlotsChart;
