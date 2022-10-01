import React, { FC } from 'react';
import PageContainer from '../../../components/PageContainer/PageContainer';
import PurchaseHistory from '../PurchaseHistory/PurchaseHistory';

const HistoryPage: FC = () => {
  return (
    <PageContainer title="История выполненных заказов">
      <div style={{ width: '75%' }}>
        <PurchaseHistory />
      </div>
    </PageContainer>
  );
};

export default HistoryPage;
