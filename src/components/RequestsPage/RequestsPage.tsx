import React from 'react';
import PageContainer from '../PageContainer/PageContainer';
import RequestsDataPanel from './RequestsDataPanel/RequestsDataPanel';
import RequestsActions from './RequestsActions/RequestsActions';
import RequestsList from './RequestsList/RequestsList';

const RequestsPage = () => {
  return (
    <PageContainer title="Заказы зрителей">
      <RequestsDataPanel />
      <RequestsActions />
      <RequestsList />
    </PageContainer>
  );
};

export default RequestsPage;
