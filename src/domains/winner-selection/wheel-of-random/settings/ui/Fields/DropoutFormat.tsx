import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SegmentedControl, SegmentedControlItem } from '@mantine/core';

import { DropoutVariant } from '../../../BaseWheel/BaseWheel';

const DropoutFormatField = () => {
  const { t } = useTranslation();

  const dropoutVariantOptions: SegmentedControlItem[] = useMemo(
    () => [
      { value: DropoutVariant.New.toString(), label: t('wheel.dropoutVariant.new') },
      { value: DropoutVariant.Classic.toString(), label: t('wheel.dropoutVariant.classic') },
    ],
    [t],
  );

  return (
    <Controller
      render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
        <SegmentedControl
          fullWidth
          color='primary'
          data={dropoutVariantOptions}
          value={value.toString()}
          onChange={(value) => onChange(Number(value))}
          disabled={isSubmitting}
        />
      )}
      name='dropoutVariant'
    />
  );
};

export default DropoutFormatField;
