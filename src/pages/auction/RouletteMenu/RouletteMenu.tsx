import { FC, useState } from 'react';
import { useSelector } from 'react-redux';

import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { RootState } from '@reducers';

import PresetSelect, { RoulettePreset } from './PresetSelect/PresetSelect';
import Roulette from './Roulette/Roulette';
import './RouletteMenu.scss';

const roulettePresets: RoulettePreset[] = [
  {
    multiplier: 2,
    id: 2,
    amount: 18,
    color: '#4682B4',
  },
  {
    multiplier: 4,
    id: 4,
    amount: 9,
    color: '#bcc95b',
  },
  {
    multiplier: 6,
    id: 6,
    amount: 6,
    color: '#FF7F50',
  },
  {
    multiplier: 18,
    id: 18,
    amount: 2,
    color: '#75adad',
  },
  {
    multiplier: 36,
    id: 36,
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
    if (!settings.luckyWheelSelectBet || winner?.multiplier === selectedPreset?.multiplier) {
      onRoll(winner!.multiplier);
    } else {
      onRoll(0);
    }
  };

  return (
    <div className='roulette-menu'>
      {selectedPreset || !settings.luckyWheelSelectBet ? (
        <Roulette presets={roulettePresets} onRoll={handleSpin} bid={bid} selectedPreset={selectedPreset} />
      ) : (
        <PresetSelect presets={selectablePresets} onSelect={setSelectedPreset} />
      )}
    </div>
  );
};

export default RouletteMenu;
