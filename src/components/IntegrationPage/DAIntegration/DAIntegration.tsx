import React, { FC } from 'react';
import { UseFormMethods } from 'react-hook-form/dist/types/form';
import { useSelector } from 'react-redux';
import { Button, Switch } from '@material-ui/core';
import { RootState } from '../../../reducers';
import SettingsGroupTitle from '../../SettingsGroupTitle/SettingsGroupTitle';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import './DAIntegration.scss';

const authParams = {
  client_id: '6727',
  redirect_uri: `${window.location.origin}/da/redirect`,
  response_type: 'code',
  scope: 'oauth-donation-subscribe',
  force_verify: 'true',
};

const authUrl = new URL('https://www.donationalerts.com/oauth/authorize');

interface DaIntegration {
  control: UseFormMethods['control'];
}

const DaIntegration: FC<DaIntegration> = ({ control }) => {
  const { username, hasDAAuth } = useSelector((root: RootState) => root.user);

  const handleAuth = (): void => {
    const params = new URLSearchParams(authParams);
    authUrl.search = params.toString();

    window.open(authUrl.toString(), '_self');
  };

  return (
    <>
      <SettingsGroupTitle title="Donation Alerts">
        <Switch disabled={!username} />
      </SettingsGroupTitle>
      {hasDAAuth ? (
        <></>
      ) : (
        <>
          <Button
            className="da-login-button"
            variant="contained"
            size="large"
            startIcon={<DASvg className="base-icon" />}
            onClick={handleAuth}
            disabled={!username}
          >
            Подключить Donation Alerts
          </Button>
          {!username && (
            <div className="hint" style={{ marginTop: 12 }}>
              (Требуется Twitch авторизация)
            </div>
          )}
        </>
      )}
    </>
  );
};

export default DaIntegration;
