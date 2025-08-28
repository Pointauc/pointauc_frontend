import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import clsx from 'clsx';
import { useState } from 'react';

import styles from './StyleSelect.module.css';

const WheelStyleSelect = () => {
  const { t } = useTranslation();

  const styleOptions = [
    { value: 'default', label: t('wheel.style.default') },
    { value: 'genshinImpact', label: t('wheel.style.genshinImpact') },
  ];

  const [hasOpenedDropdown, setHasOpenedDropdown] = useState(
    () => localStorage.getItem('wheelStyleHintShown') === 'true',
  );

  const handleOpenDropdown = () => {
    setHasOpenedDropdown(true);
    localStorage.setItem('wheelStyleHintShown', 'true');
  };

  return (
    <Controller
      name='wheelStyles'
      render={({ field: { onChange, value } }) => {
        const currentValue = value ?? 'default';
        const isGenshinSelected = currentValue === 'genshinImpact';
        const shouldShowHint = !hasOpenedDropdown && currentValue === 'default';

        return (
          <Select
            value={currentValue}
            classNames={{
              options: styles.options,
              option: styles.option,
              input: isGenshinSelected ? styles.genshinInput : styles.input,
              wrapper: clsx(styles.wrapper, isGenshinSelected ? styles.genshinWrapper : undefined),
            }}
            inputContainer={(children) => {
              return (
                <div
                  className={clsx(styles.inputContainer, {
                    [styles.withFakeBorder]: shouldShowHint,
                  })}
                >
                  {shouldShowHint && <div className={styles.fakeBorder} />}
                  {children}
                </div>
              );
            }}
            onClick={handleOpenDropdown}
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
