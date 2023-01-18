import React, { FC, useState } from 'react';

import './RouletteMenu.scss';
import PresetSelect, { RoulettePreset } from './PresetSelect/PresetSelect';
import Roulette from './Roulette/Roulette';
import { Purchase } from '../../../reducers/Purchases/Purchases';

const roulettePresets: RoulettePreset[] = [
  {
    multiplier: 2,
    amount: 18,
    color: '#4682B4',
  },
  {
    multiplier: 4,
    amount: 9,
    color: '#bcc95b',
  },
  {
    multiplier: 6,
    amount: 6,
    color: '#FF7F50',
  },
  {
    multiplier: 18,
    amount: 2,
    color: '#75adad',
  },
  {
    multiplier: 36,
    amount: 1,
    color: '#5b5b5b',
  },
];

const selectablePresets = roulettePresets.filter(({ hidden }) => !hidden);
const getPreset = (multi: number): RoulettePreset | undefined =>
  roulettePresets.find(({ multiplier }) => multiplier === multi);

interface RouletteMenuProps {
  onRoll: (preset: number) => void;
  bid: Purchase;
}

const RouletteMenu: FC<RouletteMenuProps> = ({ onRoll, bid }) => {
  const [selectedPreset, setSelectedPreset] = useState<RoulettePreset>();
  const handleSpin = (multi: number): void => {
    const winner = getPreset(multi);

    if (winner?.safe || winner?.multiplier === selectedPreset?.multiplier) {
      onRoll(winner!.multiplier);
    } else {
      onRoll(0);
    }
  };

  return (
    <div className="roulette-menu">
      {selectedPreset ? (
        <Roulette presets={roulettePresets} onRoll={handleSpin} bid={bid} selectedPreset={selectedPreset} />
      ) : (
        <PresetSelect presets={selectablePresets} onSelect={setSelectedPreset} />
      )}
    </div>
  );
};

export default RouletteMenu;
