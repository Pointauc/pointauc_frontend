import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';

import PaymentLogos from '@domains/bids/external-integrations/ihaq/ui/PaymentLogos';

const IhaqDescription = () => {
  const { t } = useTranslation();

  return (
    <span className='flex w-full flex-nowrap items-center justify-center gap-x-2'>
      <IconInfoCircle size={14} className='shrink-0' />
      <span className='text-xxs whitespace-nowrap'>{t('integration.ihaq.acceptedCurrencies')}</span>
      <PaymentLogos />
    </span>
  );
};

export default IhaqDescription;
