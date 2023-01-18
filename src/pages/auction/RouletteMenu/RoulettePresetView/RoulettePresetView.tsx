import React, { FC } from 'react';
import { Button } from '@material-ui/core';
import { RoulettePreset } from '../PresetSelect/PresetSelect';

interface RoulettePresetProps {
  preset: RoulettePreset;
  onSelect?: (preset: RoulettePreset) => void;
}

const getPresetChance = (multiplier: number): number => +((1 / multiplier) * 100).toFixed(2);

const RoulettePresetView: FC<RoulettePresetProps> = ({ preset, onSelect }) => {
  const { multiplier, color } = preset;
  const onClick = (): void => onSelect?.(preset);

  return (
    <Button style={{ backgroundColor: color }} className="roulette-preset" onClick={onClick}>
      <>
        <span>{`x${multiplier}`}</span>
        <span style={{ fontWeight: 400, marginLeft: 8 }}>{`(${getPresetChance(multiplier)}%)`}</span>
      </>
    </Button>
  );
};

export default RoulettePresetView;
