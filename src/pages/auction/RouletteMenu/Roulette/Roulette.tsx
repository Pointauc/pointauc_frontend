import React, { FC, useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { RoulettePreset } from '../PresetSelect/PresetSelect';
import { WheelItem } from '../../../../models/wheel.model';

import './Roulette.scss';
import RandomWheel, { SettingElements } from '../../../../components/RandomWheel/RandomWheel';
import { Purchase } from '../../../../reducers/Purchases/Purchases';
import PurchaseComponent from '../../PurchaseComponent/PurchaseComponent';
import RoulettePresetView from '../RoulettePresetView/RoulettePresetView';

interface RouletteProps {
  presets: RoulettePreset[];
  selectedPreset: RoulettePreset;
  onRoll: (multiplayer: number) => void;
  bid: Purchase;
}

interface PresetWheelItem extends WheelItem {
  multiplier: number;
}

const getPair = (arr: RoulettePreset[], start = 0): number => {
  for (let i = start + 1; i <= arr.length; i++) {
    const currentIndex = i === arr.length ? 0 : i;

    if (arr[currentIndex].multiplier === arr[i - 1].multiplier) {
      return i;
    }
  }

  return -1;
};

const getPairsIndexes = (arr: RoulettePreset[]): number[] => {
  const result = [];
  let cursor = 0;

  while (cursor !== -1) {
    cursor = getPair(arr, cursor);

    if (cursor !== -1) {
      result.push(cursor);
    }
  }

  return result;
};

const insertItems = (source: RoulettePreset[], subArray: RoulettePreset[]): RoulettePreset[] => {
  const result = [...source];

  const pairsIndexes = getPairsIndexes(result);
  const pairs = pairsIndexes.length;
  const maxSteps = pairs / subArray.length;
  let step = maxSteps;
  let insertedItems = 0;

  pairsIndexes.forEach((value) => {
    if (step >= maxSteps) {
      result.splice(value + insertedItems, 0, subArray.pop()!);

      insertedItems++;
      step = step - maxSteps + 1;
    } else {
      step++;
    }
  });

  return result;
};

const convertToWheelItem = ({ multiplier, color }: RoulettePreset): PresetWheelItem => ({
  id: Math.random(),
  name: `x${multiplier}`,
  amount: 1,
  color,
  multiplier,
});

const wheelElements: SettingElements = {
  mode: false,
  split: false,
  randomOrg: false,
  randomPace: false,
  import: false,
};

const Roulette: FC<RouletteProps> = ({ presets, onRoll, bid, selectedPreset }) => {
  const { t } = useTranslation();
  const rawItems = useMemo(() => {
    const items = presets.map((preset) => Array(preset.amount).fill(preset));

    return items.reduce((accum, arr) => insertItems(accum, arr)).map(convertToWheelItem);
  }, [presets]);
  const handleWin = (winner: PresetWheelItem): void => {
    onRoll(winner.multiplier);
  };

  return (
    <div className="roulette">
      <div className="roulette-wheel">
        <RandomWheel
          items={rawItems}
          isShuffle={false}
          onWin={handleWin}
          elements={wheelElements}
          initialSpinTime={5}
          hideDeleteItem
        >
          <div className="roulette-wheel-extra">
            <div className="roulette-preset-wrapper">
              <Typography>{t('auc.casino.yourLot')}</Typography>
              <RoulettePresetView preset={selectedPreset} />
            </div>
            <div>
              <Typography>{t('auc.casino.yourBid')}</Typography>
              <PurchaseComponent {...bid} hideActions disabled />
            </div>
          </div>
        </RandomWheel>
      </div>
    </div>
  );
};

export default Roulette;
