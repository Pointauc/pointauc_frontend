import React, { FC, useState } from 'react';

import './RouletteMenu.scss';
import { useSelector } from 'react-redux';
import PresetSelect, { RoulettePreset } from './PresetSelect/PresetSelect';
import Roulette from './Roulette/Roulette';
import { Purchase } from '../../../reducers/Purchases/Purchases';
import { RootState } from '../../../reducers';

const roulettePresets: RoulettePreset[] = [
  {
    multiplier: 0.25,
    amount: 10,
    color: '#4682B4',
  },
  {
    multiplier: 0.5,
    amount: 14,
    color: '#75adad',
  },
  {
    multiplier: 1.5,
    amount: 7,
    color: '#99be60',
  },
  {
    multiplier: 2,
    amount: 4,
    color: '#FF7F50',
  },
  {
    multiplier: 8,
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
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const handleSpin = (multi: number): void => {
    const winner = getPreset(multi);
    onRoll(winner!.multiplier * settings.luckyWheelMulti);

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
