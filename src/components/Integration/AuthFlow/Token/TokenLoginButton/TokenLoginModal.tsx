import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Dialog, DialogActions, DialogContent, Link, OutlinedInput, Typography } from '@mui/material';

import withLoading from '@decorators/withLoading.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import { integrationUtils } from '@components/Integration/helpers.ts';

import './TokenLoginModal.scss';

interface TokenLoginModalProps {
  opened: boolean;
  onClose: () => void;
  id: Integration.Config['id'];
  authenticate: Integration.TokenFlow['authenticate'];
}

const TokenLoginModal = ({ opened, onClose, authenticate, id }: TokenLoginModalProps) => {
  const dispatch = useDispatch();
  const [redirectConfirmationOpened, setRedirectConfirmationOpened] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authorize = async (): Promise<void> => {
    await withLoading(setIsLoading, async () => {
      await authenticate(token);
      integrationUtils.storage.set(id, 'authToken', token);
      await loadUserData(dispatch);
      onClose();
    })();
  };

  return (
    <>
      <Dialog open={redirectConfirmationOpened} onClose={() => setRedirectConfirmationOpened(false)}>
        <DialogContent>
          <Typography variant='h4'>Перед переходом на следующую страницу скройте экран на стриме</Typography>
        </DialogContent>
        <DialogActions>
          <a href='https://donatepay.ru/page/api' target='_blank' rel='noopener noreferrer'>
            <Button color='primary' variant='outlined' onClick={() => setRedirectConfirmationOpened(false)}>
              Я скрыл экран
            </Button>
          </a>
        </DialogActions>
      </Dialog>
      <Dialog open={opened} onClose={onClose} maxWidth='md' fullWidth className='token-login-modal'>
        <DialogContent>
          <Typography variant='h4' align='center'>
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
          <Typography variant='h4' align='center'>
            Получение API-key
          </Typography>
          <Typography color='error'>НЕ ПОКАЗЫВАЙТЕ КЛЮЧ API И СТРАНИЦУ DONATEPAY НА СТРИМЕ!</Typography>
          <Typography paragraph>
            <Typography component='span'>Перейдите на страницу </Typography>
            <Link className='da-link donate-pay' onClick={() => setRedirectConfirmationOpened(true)}>
              https://donatepay.ru/page/api
            </Link>
            <Typography component='span'>
              {' '}
              затем скопируйте значение поля &quot;Ваш API ключ&quot; и вставьте его в поле ниже на сайте аукциона.
            </Typography>
          </Typography>
          <OutlinedInput
            inputProps={{ className: 'token-input' }}
            autoComplete='off'
            fullWidth
            onChange={(e) => setToken(e.target.value)}
            value={token}
            type='text'
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            disabled={token.length === 0}
            color='primary'
            variant='outlined'
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

export default TokenLoginModal;
