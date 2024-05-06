import { FC, useCallback, useMemo } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { WheelItem } from '@models/wheel.model.ts';
import { Purchase } from '@reducers/Purchases/Purchases.ts';
import { RootState } from '@reducers';
import RandomWheel, { SettingElements } from '@components/RandomWheel/RandomWheel';
import array from '@utils/dataType/array.ts';

import PurchaseComponent from '../../PurchaseComponent/PurchaseComponent';
import { RoulettePreset } from '../PresetSelect/PresetSelect';
import RoulettePresetView from '../RoulettePresetView/RoulettePresetView';
import './Roulette.scss';

interface RouletteProps {
  presets: RoulettePreset[];
  selectedPreset?: RoulettePreset;
  onRoll: (multiplayer: number) => void;
  bid: Purchase;
}

interface PresetWheelItem extends WheelItem {
  multiplier: number;
}

const wheelElements: SettingElements = {
  mode: false,
  split: false,
  randomOrg: false,
  randomPace: false,
  import: false,
  preview: false,
};

// const groupByMultiplier = (items: PresetWheelItem[]): Record<number, PresetWheelItem[]> => {
//   return items.reduce<Record<number, PresetWheelItem[]>>((accum, item) => {
//     const groupedItems = accum[item.multiplier] ? [...accum[item.multiplier], item] : [item];
//
//     return { ...accum, [item.multiplier]: groupedItems };
//   }, {});
// };

const Roulette: FC<RouletteProps> = ({ presets, onRoll, bid, selectedPreset }) => {
  const { t } = useTranslation();
  const { settings } = useSelector((root: RootState) => root.aucSettings);

  const convertToWheelItem = useCallback(
    ({ multiplier, color, size }: RoulettePreset): PresetWheelItem => ({
      id: Math.random(),
      name: `x${multiplier}`,
      amount: size || 1,
      color,
      multiplier,
    }),
    [],
  );

  const rawItems = useMemo(() => {
    const items = presets.map((preset) => Array(preset.amount / (preset.size || 1)).fill(preset));

    return array.distributeEvenly<RoulettePreset>(items).map(convertToWheelItem);
  }, [convertToWheelItem, presets]);
  const handleWin = (winner: PresetWheelItem): void => {
    onRoll(winner.multiplier);
  };

  return (
    <div className='roulette'>
      <div className='roulette-wheel'>
        <RandomWheel items={rawItems} isShuffle={false} onWin={handleWin} elements={wheelElements} initialSpinTime={5}>
          {settings.luckyWheelSelectBet && selectedPreset && (
            <div className='roulette-preset-wrapper'>
              <Typography>{t('auc.casino.yourLot')}</Typography>
              <RoulettePresetView preset={selectedPreset} />
            </div>
          )}
          <div className='roulette-wheel-extra'>
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
