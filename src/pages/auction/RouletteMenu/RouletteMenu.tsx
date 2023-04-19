import React, { FC, useState } from 'react';

import './RouletteMenu.scss';
import PresetSelect, { RoulettePreset } from './PresetSelect/PresetSelect';
import Roulette from './Roulette/Roulette';
import { Purchase } from '../../../reducers/Purchases/Purchases';

const roulettePresets: RoulettePreset[] = [
  {
    multiplier: 0.25,
    amount: 20,
    size: 4,
    color: '#4682B4',
  },
  {
    multiplier: 0.5,
    amount: 18,
    color: '#75adad',
    size: 3,
  },
  {
    multiplier: 1.5,
    amount: 7,
    size: 1,
    color: '#99be60',
  },
  {
    multiplier: 2,
    amount: 3,
    size: 1,
    color: '#ecb365',
  },
  {
    multiplier: 5,
    amount: 2,
    color: '#FF7F50',
  },
  {
    multiplier: 10,
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
    onRoll(winner!.multiplier);

    // if (winner?.safe || winner?.multiplier === selectedPreset?.multiplier) {
    //   onRoll(winner!.multiplier);
    // } else {
    //   onRoll(0);
    // }
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
