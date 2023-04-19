import React, { FC, useCallback, useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RoulettePreset } from '../PresetSelect/PresetSelect';
import { WheelItem } from '../../../../models/wheel.model';

import './Roulette.scss';
import RandomWheel, { SettingElements } from '../../../../components/RandomWheel/RandomWheel';
import { Purchase } from '../../../../reducers/Purchases/Purchases';
import PurchaseComponent from '../../PurchaseComponent/PurchaseComponent';
import { getRandomIntInclusive } from '../../../../utils/common.utils';
import { RootState } from '../../../../reducers';

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

const insertBetweenPairs = (source: RoulettePreset[], subArray: RoulettePreset[]): RoulettePreset[] => {
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

const getSafeIndex = (arr: any[], index: number): number => (index > arr.length ? index - arr.length : index);

const findIndexFrom = (source: RoulettePreset[], multiplier: number, start: number): number => {
  const arr = [...source.slice(start), ...source.slice(0, (start || 1) - 1)];
  const index = arr.findIndex((preset) => preset.multiplier === multiplier);

  return index === -1 ? index : index + start;
};

const getStartIndex = (source: RoulettePreset[], multiplier: number): number => {
  const existedItem = findIndexFrom(source, multiplier, 0);

  return existedItem === -1 ? getRandomIntInclusive(0, source.length) : existedItem;
};

const insertBetweenNext = (source: RoulettePreset[], index: number, items: RoulettePreset[]): void => {
  if (items.length === 0) return;

  const { multiplier } = items[0];
  let nextIndex = findIndexFrom(source, multiplier, index + 1);

  if (nextIndex === -1) {
    nextIndex = source.length + index;

    const insertPosition = index + Math.floor((nextIndex - index) / 2);
    const safePosition = getSafeIndex(source, insertPosition);

    source.splice(safePosition, 0, items.pop()!);

    insertBetweenNext(source, safePosition, items);

    return;
  }

  const insertPosition = index + Math.ceil((nextIndex - index) / 2);
  source.splice(getSafeIndex(source, insertPosition), 0, items.pop()!);

  if (getSafeIndex(source, nextIndex + 1) < index) {
    insertBetweenNext(source, getSafeIndex(source, nextIndex + 1), items);
  } else {
    insertBetweenNext(source, nextIndex + 1, items);
  }
};

const insertEvenly = (source: RoulettePreset[], subArray: RoulettePreset[]): RoulettePreset[] => {
  const result = [...source];

  const start = getStartIndex(source, subArray[0].multiplier);

  insertBetweenNext(result, start, subArray);

  return result;
};

const insertItems = (source: RoulettePreset[], subArray: RoulettePreset[]): RoulettePreset[] => {
  const subArrayClone = [...subArray];

  const processedSource = insertBetweenPairs(source, subArrayClone);

  return subArrayClone.length === 0 ? processedSource : insertEvenly(processedSource, subArrayClone);
};

const wheelElements: SettingElements = {
  mode: false,
  split: false,
  randomOrg: false,
  randomPace: false,
  import: false,
};

// const groupByMultiplier = (items: PresetWheelItem[]): Record<number, PresetWheelItem[]> => {
//   return items.reduce<Record<number, PresetWheelItem[]>>((accum, item) => {
//     const groupedItems = accum[item.multiplier] ? [...accum[item.multiplier], item] : [item];
//
//     return { ...accum, [item.multiplier]: groupedItems };
//   }, {});
// };

const Roulette: FC<RouletteProps> = ({ presets, onRoll, bid }) => {
  const { t } = useTranslation();
  const { settings } = useSelector((root: RootState) => root.aucSettings);

  const convertToWheelItem = useCallback(
    ({ multiplier, color, size }: RoulettePreset): PresetWheelItem => ({
      id: Math.random(),
      name: `x${multiplier * settings.luckyWheelMulti}`,
      amount: size || 1,
      color,
      multiplier,
    }),
    [settings.luckyWheelMulti],
  );

  const rawItems = useMemo(() => {
    const items = presets.map((preset) => Array(preset.amount / (preset.size || 1)).fill(preset));

    return items.reduce((accum, arr) => insertItems(accum, arr)).map(convertToWheelItem);
  }, [convertToWheelItem, presets]);
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
