import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextField } from '@material-ui/core';
import { RootState } from '../../../reducers';
import RequestsTable from '../RequestsTable/RequestsTable';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { getRandomIntInclusive } from '../../../utils/common.utils';
import { UserRequest } from '../../../models/requests.model';
import { addRequestWinner, deleteRequestWinner, setWinnersList } from '../../../reducers/Requests/Requests';
import { addAlert } from '../../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../../models/alert.model';

interface RequestsWinnersProps {
  openWheel: (data: UserRequest[]) => void;
}

const RequestsWinners: FC<RequestsWinnersProps> = ({ openWheel }) => {
  const dispatch = useDispatch();
  const { winnersListData, currentListData = [] } = useSelector((root: RootState) => root.requests);
  const [randomCount, setRandomCount] = useState<number>(1);

  const clearWinnersList = useCallback(() => {
    dispatch(setWinnersList([]));
  }, [dispatch]);

  const handleRandomCountChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRandomCount(Number(e.target.value));
  }, []);

  const addRandomWinners = useCallback(() => {
    if (currentListData.length) {
      for (let i = 0; i < randomCount; i++) {
        if (currentListData.length !== winnersListData.length) {
          let winnerIndex = -1;
          while (winnerIndex === -1 || winnersListData.includes(currentListData[winnerIndex])) {
            winnerIndex = getRandomIntInclusive(0, currentListData.length - 1);
          }

          dispatch(addRequestWinner(currentListData[winnerIndex]));
        }
      }
    }
  }, [currentListData, dispatch, randomCount, winnersListData]);

  const handleWheelClick = useCallback(() => {
    openWheel(winnersListData);
  }, [openWheel, winnersListData]);

  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteRequestWinner(id));
    },
    [dispatch],
  );

  const copyTableData = useCallback(async () => {
    const dataText = winnersListData.map(({ request }) => request).join('; ');

    await navigator.clipboard.writeText(dataText);
    dispatch(addAlert({ duration: 3000, type: AlertTypeEnum.Success, message: 'Победители скопированы' }));
  }, [dispatch, winnersListData]);

  return (
    <div style={{ marginBottom: 10 }}>
      <SettingsGroupTitle title="Победители" />
      <div className="row">
        <div className="col">
          <Button variant="contained" color="primary" onClick={addRandomWinners}>
            Выбрать случайно
          </Button>
          <TextField
            style={{ width: 50, margin: 0 }}
            variant="outlined"
            margin="dense"
            InputProps={{ type: 'number' }}
            onChange={handleRandomCountChange}
            value={randomCount || ''}
          />
          <Button variant="outlined" color="primary" onClick={handleWheelClick}>
            крутить колесо
          </Button>
          <Button variant="outlined" onClick={clearWinnersList}>
            Очистить
          </Button>
        </div>
        <div className="col">
          <Button variant="outlined" onClick={copyTableData}>
            Копировать
          </Button>
        </div>
      </div>
      <RequestsTable requests={winnersListData} onDelete={handleDelete} />
    </div>
  );
};

export default RequestsWinners;
