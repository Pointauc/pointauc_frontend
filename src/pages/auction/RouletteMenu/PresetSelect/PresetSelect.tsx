import { FC } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import RoulettePresetView from '../RoulettePresetView/RoulettePresetView';
import './PresetSelect.scss';

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
    <div className='roulette-preset-select'>
      <Typography variant='h2'>{t('auc.casino.selectLot')}</Typography>
      <Typography className='roulette-preset-select-desc'>{t('auc.casino.description')}</Typography>
      <Typography className='roulette-preset-select-warning'>{t('auc.casino.warning')}</Typography>
      <div className='roulette-menu-presets'>
        {presets.map((preset) => (
          <RoulettePresetView key={preset.multiplier} preset={preset} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default PresetSelect;
