import React, { FC, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, OutlinedInput, Typography, Link } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { authenticateDonatePay } from '../../../api/donatePayApi';
import { loadUserData } from '../../../reducers/AucSettings/AucSettings';
import withLoading from '../../../decorators/withLoading';
import LoadingButton from '../../LoadingButton/LoadingButton';
import { updateIntegration } from '../../../api/userApi';

interface DonatePayLoginModalProps {
  opened: boolean;
  onClose: () => void;
}

const DonatePayLoginModal: FC<DonatePayLoginModalProps> = ({ opened, onClose }) => {
  const dispatch = useDispatch();
  const [redirectConfirmationOpened, setRedirectConfirmationOpened] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authorize = async (): Promise<void> => {
    await withLoading(setIsLoading, async () => {
      const { isNew } = await authenticateDonatePay(token);
      if (isNew) {
        await updateIntegration({ da: { pointsRate: 1 } });
      }
      await loadUserData(dispatch);
      onClose();
    })();
  };

  return (
    <>
      <Dialog open={redirectConfirmationOpened} onClose={() => setRedirectConfirmationOpened(false)}>
        <DialogContent>
          <Typography variant="h4">Перед переходом на следующую страницу скройте экран на стриме</Typography>
        </DialogContent>
        <DialogActions>
          <a href="https://donatepay.ru/page/api" target="_blank" rel="noopener noreferrer">
            <Button color="primary" variant="outlined" onClick={() => setRedirectConfirmationOpened(false)}>
              Я скрыл экран
            </Button>
          </a>
        </DialogActions>
      </Dialog>
      <Dialog open={opened} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h4" align="center">
            Интеграция с DonatePay
          </Typography>
          <Typography>
            Подключение DonatePay позволит отображать приходящие донаты прямо на сайте в реальном времени. Это
            значительно упрощает и ускоряет процесс добавления ставок в аукцион, а также открывает несколько новых
            функций сайта.
          </Typography>
          <Typography>
            Сайт НЕ отслеживает и НЕ хранит статистику по донатам на своих серверах, в том числе и личную информацию
            стримера как например имеил, данные карт, баланс и т.д. Вся статистика, которую можно найти на сайте,
            хранится в браузере на компьютере юзера и удаляется при закрытии вкладки.
          </Typography>
          <Typography variant="h4" align="center">
            Получение API-key
          </Typography>
          <Typography color="error">НЕ ПОКАЗЫВАЙТЕ КЛЮЧ API И СТРАНИЦУ DONATEPAY НА СТРИМЕ!</Typography>
          <Typography paragraph>
            <Typography component="span">Перейдите на страницу </Typography>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Link className="da-link donate-pay" onClick={() => setRedirectConfirmationOpened(true)}>
              https://donatepay.ru/page/api
            </Link>
            <Typography component="span">
              {' '}
              затем скопируйте значение поля &quot;Ваш API ключ&quot; и вставьте его в поле ниже на сайте аукциона.
            </Typography>
          </Typography>
          <OutlinedInput
            autoComplete="off"
            fullWidth
            onChange={(e) => setToken(e.target.value)}
            value={token}
            type="password"
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={token.length === 0}
            color="primary"
            variant="outlined"
            onClick={authorize}
            isLoading={isLoading}
          >
            Авторизироваться
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DonatePayLoginModal;
