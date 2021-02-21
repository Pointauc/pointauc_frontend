import React, { FC } from 'react';
import './ServerStatus.scss';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { RootState } from '../../reducers';
import { ReactComponent as TwitchSvg } from '../../assets/icons/twitch.svg';
import { ReactComponent as DASvg } from '../../assets/icons/DAAlert.svg';

const ServerStatus: FC = () => {
  const {
    twitch: { actual: isTwitchActive },
    da: { actual: isDaActive },
  } = useSelector((root: RootState) => root.subscription);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const { username } = useSelector((root: RootState) => root.user);

  const isIntegrationActive = isTwitchActive || isDaActive;
  const thumbClasses = classNames('server-status-thumb', { unavalable: !webSocket });

  if (!username) {
    return null;
  }

  return (
    <div className="server-status">
      <div className="server-status-label">Статус сервера:</div>
      <div className={thumbClasses} />
      {(isIntegrationActive || !webSocket) && (
        <div className="active-integration">
          {webSocket ? (
            <>
              {isTwitchActive && <TwitchSvg className="base-icon twitch" />}
              {isDaActive && <DASvg className="base-icon da" />}
            </>
          ) : (
            <div>переподключение...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerStatus;
