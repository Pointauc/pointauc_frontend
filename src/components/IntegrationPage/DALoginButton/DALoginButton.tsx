import React, { FC, useCallback, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, Link, Typography } from '@material-ui/core';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import './DALoginButton.scss';

const authParams = {
  client_id: '6727',
  redirect_uri: `${window.location.origin}/da/redirect`,
  response_type: 'code',
  scope: 'oauth-donation-subscribe oauth-user-show',
  force_verify: 'true',
};

const authUrl = new URL('https://www.donationalerts.com/oauth/authorize');

const TwitchLoginButton: FC = () => {
  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const toggleOpen = useCallback(() => {
    setOpenDialog((open) => !open);
  }, []);

  return (
    <>
      <Button
        className="da-login-button"
        variant="contained"
        size="large"
        startIcon={<DASvg className="base-icon da" />}
        onClick={toggleOpen}
      >
        Подключить Donation Alerts
      </Button>
      <Dialog open={openDialog} onClose={toggleOpen} className="dialog" maxWidth="sm" fullWidth>
        <DialogContent dividers className="content">
          <Typography>
            <span>Перед тем как подключить Donation alerts, проверьте, что вы залогинены на самом сайте DA </span>
            <Link href="https://www.donationalerts.com/" rel="noopener noreferrer" target="_blank">
              https://www.donationalerts.com/
            </Link>
            <span> и после этого нажмите кнопку "Продолжить авторизацию"</span>
          </Typography>
          <br />
          <Typography style={{ color: '#A9A9A9' }}>
            Недавно появилась ошибка из-за которой на стороне DA не открывается форма для входа в аккаунт, поэтому
            подключить этот сайт к донатам не получится, пока вы не войдете в свой аккаунт. В ближайшее время буду
            думать как это исправить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpen} color="default" variant="outlined">
            закрыть
          </Button>
          <Button onClick={handleAuth} color="primary" variant="contained">
            Продолжить авторизацию
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TwitchLoginButton;
