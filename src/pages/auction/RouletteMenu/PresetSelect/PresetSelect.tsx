import { FC } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import RoulettePresetView from '../RoulettePresetView/RoulettePresetView';
import classes from './PresetSelect.module.css';

export interface RoulettePreset {
  amount: number;
  multiplier: number;
  id: number;
  color: string;
  hidden?: boolean;
  safe?: boolean;
  size?: number;
}

interface PresetSelectProps {
  presets: RoulettePreset[];
  onSelect: (preset: RoulettePreset) => void;
}

const PresetSelect: FC<PresetSelectProps> = ({ presets, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className={classes.roulettePresetSelect}>
      <Text size='xl'>{t('auc.casino.selectLot')}</Text>
      <Text>{t('auc.casino.description')}</Text>
      <Text className={classes.roulettePresetSelectWarning}>{t('auc.casino.warning')}</Text>
      <div>
        {presets.map((preset) => (
          <RoulettePresetView key={preset.multiplier} preset={preset} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default PresetSelect;
