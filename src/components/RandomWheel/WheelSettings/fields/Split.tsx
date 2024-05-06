import React from 'react';
import { Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

import Hint from '@components/Hint';

const SplitField = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className='wheel-controls-row'>
        <div className='wheel-controls-tip md'>
          {t('wheel.dividing')}
          <Hint text={t('wheel.dividingDesc')} />
        </div>
        <Controller
          render={({ field: { onChange, value } }) => (
            <Slider
              step={0.1}
              min={0.1}
              max={1}
              valueLabelDisplay='auto'
              onChange={(_, value) => onChange(Number(value))}
              value={value}
              marks={[
                { value: 0.1, label: `${t('common.max')} / 10` },
                { value: 1, label: t('common.max') },
              ]}
            />
          )}
          name='split'
        />
      </div>
    </>
  );
};

export default SplitField;
