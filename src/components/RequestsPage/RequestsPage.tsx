import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { useSelector } from 'react-redux';
import PageContainer from '../PageContainer/PageContainer';
import RequestsDataPanel from './RequestsDataPanel/RequestsDataPanel';
import RequestsWinners from './RequestsActions/RequestsWinners';
import RequestsList from './RequestsList/RequestsList';
import { WheelItem } from '../../models/wheel.model';
import { UserRequest } from '../../models/requests.model';
import { getCookie, getWheelColor } from '../../utils/common.utils';
import RandomWheel from '../RandomWheel/RandomWheel';
import StepWrapper from './StepWrapper/StepWrapper';
import { RootState } from '../../reducers';
import TwitchLoginButton from '../IntegrationPage/TwitchLoginButton/TwitchLoginButton';

const RequestsPage: FC = () => {
  const { hasTwitchAuth } = useSelector((root: RootState) => root.user);
  const [currentData, setCurrentData] = useState<UserRequest[]>();
  const [warningOpen, setWarningOpen] = useState<boolean>(false);
  const closeWarning = (): void => {
    setWarningOpen(false);
    document.cookie = 'seenRequestWarning=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
  };

  useEffect(() => {
    setWarningOpen(!getCookie('seenRequestWarning'));
  }, []);

  const wheelItems = useMemo(
    () =>
      currentData?.map<WheelItem>(({ username, id, request }) => ({
        name: request ? `${username}: ${request}` : username,
        id,
        color: getWheelColor(),
      })),
    [currentData],
  );

  const moveToUsersRequests = useCallback(() => {
    setCurrentData(undefined);
  }, []);

  if (!hasTwitchAuth) {
    return (
      <div>
        <TwitchLoginButton />
        <div>Авторизируйтесь, чтобы продолжить</div>
      </div>
    );
  }

  return (
    <PageContainer title="Заказы зрителей">
      <Dialog open={warningOpen} className="description-dialog" maxWidth="md">
        <DialogTitle>Внимание!</DialogTitle>
        <DialogContent className="description-dialog-content">
          <div>Это только начальная версию. На данный момент использовать эту страницу можно двумя способами:</div>
          <ol>
            <li>
              Если вы хотите прямо сейчас заролить человека из чата или его реквест. Работает аналогично Marbles On
              Stream. Для этого вам надо просто создать новый список и открыть голосование, далее люди в чате пишут
              команду и попадают в список, который можно заролить колесом или другими способами.
              <div style={{ color: '#ff5c36' }}>
                Зрители добавляются на сайт только пока открыта вкладка!!! Списки пока что не сохраняются между
                сессиями!
              </div>
            </li>
            <li>
              Если вы уже пользуетесь ботом Камиля (Camille) для заказов сабов, кто понял тот поймет. Работает все по
              схеме выше, но заказы загружаются с бота. Если у вас есть какой-то другой бот, которых собирает заказы
              зрителей и вы хотите, чтобы его можно было перенести на этот сайт, можете написать мне, я ченить придумаю.
            </li>
          </ol>
          <div>
            Можете предложить идеи для новых форматов выбора заказов зрителей. Планируется добавить формат турнира по
            типу как у Ласки, но вы можете предложить, как его можно было бы доработать. Мои контакты есть на странице
            "Гайд".
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeWarning}>
            Понятно
          </Button>
        </DialogActions>
      </Dialog>
      {wheelItems && (
        <StepWrapper className="wheel-wrapper" backSteepTitle="Вернуться к списку" onBackStep={moveToUsersRequests}>
          <RandomWheel items={wheelItems} />
        </StepWrapper>
      )}
      <div hidden={!!wheelItems}>
        <RequestsDataPanel />
        <RequestsWinners openWheel={setCurrentData} />
        <RequestsList openWheel={setCurrentData} />
      </div>
    </PageContainer>
  );
};

export default RequestsPage;
