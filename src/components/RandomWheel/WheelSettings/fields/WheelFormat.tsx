import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

import RadioButtonGroup, { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import { WheelFormat } from '@constants/wheel.ts';
import '@components/RandomWheel/WheelSettings/fields/WheelFormat.scss';

const WheelFormatField = () => {
  const { t } = useTranslation();

  const wheelOptions: Option<WheelFormat>[] = useMemo(
    () => [
      { key: WheelFormat.Default, label: t('wheel.format.normal') },
      { key: WheelFormat.Dropout, label: t('wheel.format.dropout') },
      { key: WheelFormat.BattleRoyal, label: t('wheel.format.battleRoyal') },
    ],
    [t],
  );

  return (
    <Controller
      render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
        <RadioButtonGroup
          className='wheel-format-field'
          fullWidth
          options={wheelOptions}
          activeKey={value}
          onChangeActive={onChange}
          disabled={isSubmitting}
        />
      )}
      name='format'
    />
  );
};

export default WheelFormatField;
