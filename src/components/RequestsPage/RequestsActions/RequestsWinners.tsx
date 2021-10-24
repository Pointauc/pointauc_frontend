import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextField } from '@material-ui/core';
import { RootState } from '../../../reducers';
import RequestsTable from '../RequestsTable/RequestsTable';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { getRandomIntInclusive } from '../../../utils/common.utils';
import { UserRequest } from '../../../models/requests.model';
import { addRequestWinner, deleteRequestWinner, getList, setWinnersData } from '../../../reducers/Requests/Requests';
import { addAlert } from '../../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../../models/alert.model';

interface RequestsWinnersProps {
  openWheel: (data: UserRequest[]) => void;
}

const RequestsWinners: FC<RequestsWinnersProps> = ({ openWheel }) => {
  const dispatch = useDispatch();
  const { lists, currentList } = useSelector((root: RootState) => root.requests);
  const [randomCount, setRandomCount] = useState<number>(1);

  const { winnersData, allData } = useMemo(() => getList(lists, currentList), [currentList, lists]);

  const clearWinnersList = useCallback(() => {
    dispatch(setWinnersData({ data: [] }));
  }, [dispatch]);

  const handleRandomCountChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setRandomCount(Number(e.target.value));
  }, []);

  const addRandomWinners = useCallback(() => {
    if (allData.length) {
      for (let i = 0; i < randomCount; i++) {
        if (allData.length !== winnersData.length) {
          let winnerIndex = -1;
          while (winnerIndex === -1 || winnersData.includes(allData[winnerIndex])) {
            winnerIndex = getRandomIntInclusive(0, allData.length - 1);
          }

          dispatch(addRequestWinner({ data: allData[winnerIndex] }));
        }
      }
    }
  }, [allData, dispatch, randomCount, winnersData]);

  const handleWheelClick = useCallback(() => {
    openWheel(winnersData);
  }, [openWheel, winnersData]);

  const handleDelete = useCallback(
    (id: string): void => {
      dispatch(deleteRequestWinner({ data: id }));
    },
    [dispatch],
  );

  const copyTableData = useCallback(async () => {
    const dataText = winnersData.map(({ request }) => request).join('; ');

    await navigator.clipboard.writeText(dataText);
    dispatch(addAlert({ duration: 3000, type: AlertTypeEnum.Success, message: 'Победители скопированы' }));
  }, [dispatch, winnersData]);

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
      <RequestsTable requests={winnersData} onDelete={handleDelete} />
    </div>
  );
};

export default RequestsWinners;
