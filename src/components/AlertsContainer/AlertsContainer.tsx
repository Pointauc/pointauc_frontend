import React, { FC } from 'react';
import './AlertsContainer.scss';
import { useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { RootState } from '../../reducers';
import BaseAlert from './BaseAlert/BaseAlert';

const AlertsContainer: FC = () => {
  const { alerts } = useSelector((root: RootState) => root.notifications);

  return (
    <div className="alerts-container">
      <TransitionGroup>
        {alerts.map((alert) => (
          <CSSTransition timeout={250} key={alert.id} classNames="example">
            <BaseAlert {...alert} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default AlertsContainer;
