import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RadioButtonGroup, { Option } from '@components/RadioButtonGroup/RadioButtonGroup.tsx';
import { DropoutVariant } from '@components/BaseWheel/BaseWheel.tsx';

const DropoutFormatField = () => {
  const { t } = useTranslation();

  const dropoutVariantOptions: Option<DropoutVariant>[] = useMemo(
    () => [
      { key: DropoutVariant.New, label: t('wheel.dropoutVariant.new') },
      { key: DropoutVariant.Classic, label: t('wheel.dropoutVariant.classic') },
    ],
    [t],
  );

  return (
    <Controller
      render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
        <RadioButtonGroup
          fullWidth
          options={dropoutVariantOptions}
          activeKey={value}
          onChangeActive={onChange}
          disabled={isSubmitting}
        />
      )}
      name='dropoutVariant'
    />
  );
};

export default DropoutFormatField;
