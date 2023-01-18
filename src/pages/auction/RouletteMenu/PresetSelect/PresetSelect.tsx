import React, { FC } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import './PresetSelect.scss';
import RoulettePresetView from '../RoulettePresetView/RoulettePresetView';

export interface RoulettePreset {
  amount: number;
  multiplier: number;
  color: string;
  hidden?: boolean;
  safe?: boolean;
}

interface PresetSelectProps {
  presets: RoulettePreset[];
  onSelect: (preset: RoulettePreset) => void;
}

const PresetSelect: FC<PresetSelectProps> = ({ presets, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="roulette-preset-select">
      <Typography variant="h2">{t('auc.casino.selectLot')}</Typography>
      <Typography className="roulette-preset-select-desc">{t('auc.casino.description')}</Typography>
      <Typography className="roulette-preset-select-warning">{t('auc.casino.warning')}</Typography>
      <div className="roulette-menu-presets">
        {presets.map((preset) => (
          <RoulettePresetView key={preset.multiplier} preset={preset} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default PresetSelect;
