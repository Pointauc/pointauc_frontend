import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';

import styles from './StyleSelect.module.css';

const WheelStyleSelect = () => {
  const { t } = useTranslation();

  const styleOptions = [
    { value: 'default', label: t('wheel.style.default') },
    { value: 'genshinImpact', label: t('wheel.style.genshinImpact') },
  ];

  return (
    <Controller
      name='wheelStyles'
      render={({ field: { onChange, value } }) => {
        const currentValue = value ?? 'default';
        const isGenshinSelected = currentValue === 'genshinImpact';

        return (
          <Select
            value={currentValue}
            classNames={{
              options: styles.options,
              option: styles.option,
              input: isGenshinSelected ? styles.genshinInput : undefined,
              wrapper: isGenshinSelected ? styles.genshinWrapper : undefined,
            }}
            onChange={onChange}
            data={styleOptions}
            label={t('wheel.style.label')}
          />
        );
      }}
    />
  );
};

export default WheelStyleSelect;
