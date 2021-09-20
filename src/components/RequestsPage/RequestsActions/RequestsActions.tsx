import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reducers';
import RequestsTable from '../RequestsTable/RequestsTable';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';

const RequestsActions: FC = () => {
  const { winnersListData } = useSelector((root: RootState) => root.requests);
  return (
    <div>
      <SettingsGroupTitle title="Победители" />
      <RequestsTable requests={winnersListData} />
    </div>
  );
};

export default RequestsActions;
