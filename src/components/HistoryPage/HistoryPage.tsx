import React, { FC } from 'react';
import PageContainer from '../PageContainer/PageContainer';
import PurchaseHistory from '../AucPage/PurchaseHistory/PurchaseHistory';

const HistoryPage: FC = () => {
  return (
    <PageContainer title="История выполненных заказов">
      <div style={{ width: '70%' }}>
        <PurchaseHistory />
      </div>
    </PageContainer>
  );
};

export default HistoryPage;
