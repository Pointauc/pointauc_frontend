import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reducers';
import RequestsTable from '../RequestsTable/RequestsTable';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';

const RequestsList: FC = () => {
  const { currentListData } = useSelector((root: RootState) => root.requests);
  return (
    <div>
      <SettingsGroupTitle title="Все заказы" />
      <RequestsTable requests={currentListData} />
    </div>
  );
};

export default RequestsList;
