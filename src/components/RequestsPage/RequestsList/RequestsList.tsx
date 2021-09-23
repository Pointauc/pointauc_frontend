import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { RootState } from '../../../reducers';
import RequestsTable from '../RequestsTable/RequestsTable';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { UserRequest } from '../../../models/requests.model';
import { deleteRequest, setCurrentList } from '../../../reducers/Requests/Requests';

interface RequestsListProps {
  openWheel: (data: UserRequest[]) => void;
}

const RequestsList: FC<RequestsListProps> = ({ openWheel }) => {
  const dispatch = useDispatch();
  const { currentListData } = useSelector((root: RootState) => root.requests);

  const clearWinnersList = useCallback(() => {
    dispatch(setCurrentList([]));
  }, [dispatch]);

  const handleWheelClick = useCallback(() => {
    openWheel(currentListData || []);
  }, [openWheel, currentListData]);

  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteRequest(id));
    },
    [dispatch],
  );

  return (
    <div>
      <SettingsGroupTitle title="Все заказы" />
      <div className="row">
        <Button variant="outlined" color="primary" onClick={handleWheelClick}>
          крутить колесо
        </Button>
        <Button variant="outlined" onClick={clearWinnersList}>
          Очистить
        </Button>
      </div>
      <RequestsTable requests={currentListData || []} loading={!currentListData} onDelete={handleDelete} />
    </div>
  );
};

export default RequestsList;
