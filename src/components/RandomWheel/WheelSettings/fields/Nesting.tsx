import React from 'react';
import { Slider, Typography } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Hint from '@components/Hint';

interface Props {
  maxDepth?: number;
}

const Nesting = ({ maxDepth }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <div className='wheel-controls-row'>
        <Typography className='wheel-controls-tip md'>
          {t('wheel.nesting')}
          <Hint text={t('wheel.nestingDesc')} />
        </Typography>
        <Controller
          render={({ field: { onChange, value } }) => (
            <Slider
              step={1}
              min={1}
              max={maxDepth || 1}
              valueLabelDisplay='auto'
              onChange={(_, value) => onChange(value as number)}
              value={value || 1}
              marks={[
                { value: maxDepth || 1, label: maxDepth },
                { value: 1, label: '1' },
              ]}
            />
          )}
          name='depthRestriction'
        />
      </div>
    </>
  );
};

export default Nesting;
