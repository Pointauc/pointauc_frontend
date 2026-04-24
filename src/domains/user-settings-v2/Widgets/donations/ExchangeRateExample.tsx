import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SettingsForm } from '@models/settings.model.ts';

const examplePresets = [50, 100];

const ExchangeRateExample = () => {
  const { control } = useFormContext<SettingsForm>();
  const { t } = useTranslation();

  const pointsRate = useWatch({ control, name: 'pointsRate' });
  const numericPointsRate = Number(pointsRate ?? 0);

  return (
    <>
      {examplePresets
        .map((money) => `${money} ${t('common.currencySign')} = ${(money * numericPointsRate).toLocaleString()}`)
        .join(' | ')}
    </>
  );
};

export default ExchangeRateExample;
