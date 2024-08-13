import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import PageContainer from '@components/PageContainer/PageContainer';

import PurchaseHistory from '../PurchaseHistory/PurchaseHistory';

const HistoryPage: FC = () => {
  const { t } = useTranslation();

  return (
    <PageContainer title={t('history.title')}>
      <PurchaseHistory />
    </PageContainer>
  );
};

export default HistoryPage;
