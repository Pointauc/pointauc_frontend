import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { SegmentedControl, SegmentedControlItem } from '@mantine/core';

import { WheelFormat } from '@constants/wheel.ts';

import '@domains/winner-selection/wheel-of-random/settings/ui/Fields/WheelFormat.scss';

const WheelFormatField = () => {
  const { t } = useTranslation();

  const wheelOptions: SegmentedControlItem[] = useMemo(
    () => [
      { value: WheelFormat.Default.toString(), label: t('wheel.format.normal') },
      { value: WheelFormat.Dropout.toString(), label: t('wheel.format.dropout') },
      { value: WheelFormat.BattleRoyal.toString(), label: t('wheel.format.battleRoyal') },
    ],
    [t],
  );

  return (
    <Controller
      render={({ field: { onChange, value }, formState: { isSubmitting } }) => {
        return (
          <SegmentedControl
            className='wheel-format-field'
            fullWidth
            color='primary'
            data={wheelOptions}
            value={value.toString()}
            onChange={(value) => onChange(Number(value))}
            disabled={isSubmitting}
          />
        );
      }}
      name='format'
    />
  );
};

export default WheelFormatField;
