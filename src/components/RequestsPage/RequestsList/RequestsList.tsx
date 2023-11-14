import { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Theme, StyledEngineProvider } from '@mui/material';

import { RootState } from '@reducers';
import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle';
import { UserRequest } from '@models/requests.model.ts';
import { deleteRequest, getList, setAllData, setSyncState, syncWithAuc } from '@reducers/Requests/Requests.ts';

import RequestsTable from '../RequestsTable/RequestsTable';

interface RequestsListProps {
  openWheel: (data: UserRequest[]) => void;
}

const RequestsList: FC<RequestsListProps> = ({ openWheel }) => {
  const dispatch = useDispatch();
  const { lists, currentList, isLoading } = useSelector((root: RootState) => root.requests);
  const { allData, isSyncWithAuc } = useMemo(() => getList(lists, currentList), [currentList, lists]);

  const clearWinnersList = useCallback(() => {
    dispatch(setAllData({ data: [] }));
  }, [dispatch]);

  const handleWheelClick = useCallback(() => {
    openWheel(allData || []);
  }, [openWheel, allData]);

  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteRequest({ data: id }));
    },
    [dispatch],
  );

  const handleSync = (): void => {
    dispatch(syncWithAuc());
  };

  const handleDeSync = (): void => {
    dispatch(setSyncState({ data: false }));
  };

  return (
    <div>
      <SettingsGroupTitle title='Все заказы' />
      <div className='row'>
        <div className='col'>
          <Button variant='outlined' color='primary' onClick={handleWheelClick}>
            крутить колесо
          </Button>
          <Button variant='outlined' onClick={clearWinnersList}>
            Очистить
          </Button>
          <StyledEngineProvider injectFirst>
            {isSyncWithAuc ? (
              <Button variant='outlined' onClick={handleDeSync}>
                отменить синхронизацию
              </Button>
            ) : (
              <Button variant='outlined' color='success' onClick={handleSync}>
                синхронизировать с аукционом
              </Button>
            )}
          </StyledEngineProvider>
        </div>
      </div>
      <RequestsTable requests={allData} loading={isLoading} onDelete={handleDelete} />
    </div>
  );
};

export default RequestsList;
