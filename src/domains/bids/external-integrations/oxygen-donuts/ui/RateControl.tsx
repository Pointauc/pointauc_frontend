import { NumberInput, Text, Tooltip } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsValidRate, loadRate, MAX_RATE, MIN_RATE, saveRate } from '../lib/rate';

/**
 * Oxygen Donuts reports donations in US dollars. This sets how much one dollar counts for in the auction.
 */
const OxygenDonutsRateControl = () => {
  const { t } = useTranslation();
  const [rate, setRate] = useState<number | string>(loadRate);

  const handleChange = (value: number | string): void => {
    setRate(value);

    if (checkIsValidRate(value)) {
      saveRate(value);
    }
  };

  return (
    <Tooltip label={t('integration.oxygenDonuts.rate.description')} withArrow multiline maw={280}>
      <div className='mb-2 flex items-center gap-2'>
        <Text component='span' size='sm' className='flex-none'>
          1 $ =
        </Text>
        <NumberInput
          className='min-w-0 flex-1'
          size='sm'
          aria-label={t('integration.oxygenDonuts.rate.label')}
          value={rate}
          min={MIN_RATE}
          max={MAX_RATE}
          decimalScale={2}
          allowNegative={false}
          hideControls
          onChange={handleChange}
          // An empty or out-of-range value is not saved: show the rate that is actually in use again.
          onBlur={() => setRate(loadRate())}
        />
      </div>
    </Tooltip>
  );
};

export default OxygenDonutsRateControl;
