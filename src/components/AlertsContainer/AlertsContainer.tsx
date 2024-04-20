import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import 'dayjs/locale/ru';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { RootState } from '@reducers';

import BaseAlert from './BaseAlert/BaseAlert';

import './AlertsContainer.scss';

interface DeployIncomingNotification {
  date: string;
}

interface NotificationItem {
  translationKey: 'deployIncoming';
  data: DeployIncomingNotification;
}

const AlertsContainer: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { alerts } = useSelector((root: RootState) => root.notifications);
  const { globalSocket } = useSelector((root: RootState) => root.socketIo);

  useEffect(() => {
    globalSocket?.on('notification', ({ translationKey, data }: NotificationItem) => {
      const date = dayjs(data.date);
      const replace = { remainingEstimation: date.fromNow(), remainingTime: date.format('HH:mm') };

      dispatch(
        addAlert({
          type: AlertTypeEnum.Warning,
          message: t(`serverNotifications.${translationKey}`, '', { replace }),
          duration: false,
          closable: true,
        }),
      );
    });
  }, [globalSocket, dispatch]);

  return (
    <div className='alerts-container'>
      <TransitionGroup>
        {alerts.map((alert) => (
          <CSSTransition timeout={250} key={alert.id} classNames='example'>
            <BaseAlert {...alert} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default AlertsContainer;
