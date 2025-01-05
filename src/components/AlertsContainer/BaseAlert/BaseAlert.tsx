import { FC, useCallback, useEffect, useState } from 'react';
import { Alert } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { LinearProgress } from '@mui/material';

import { AlertType } from '@models/alert.model.ts';
import { deleteAlert } from '@reducers/notifications/notifications.ts';
import { ALERT_LIFETIME } from '@constants/common.constants.ts';

import '@components/AlertsContainer/BaseAlert/BaseAlert.scss';

const BaseAlert: FC<AlertType> = (props) => {
  const { id, type, message, showCountdown, variant = 'filled', duration, closable } = props;
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(100);

  const closeAlert = useCallback(() => {
    dispatch(deleteAlert(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (duration === false) return;

    showCountdown && setProgress(0);

    const timeout = setTimeout(() => closeAlert(), duration || ALERT_LIFETIME);
    return (): void => clearTimeout(timeout);
  }, [closeAlert, dispatch, duration, id, showCountdown]);

  return (
    <Alert className='base-alert' severity={type} variant={variant} onClose={closable ? closeAlert : undefined}>
      {message}
      {showCountdown && (
        <LinearProgress
          sx={{ ['& .MuiLinearProgress-bar']: { transition: `${duration}ms linear` } }}
          variant='determinate'
          className='base-alert-progress'
          value={progress}
        />
      )}
    </Alert>
  );
};

export default BaseAlert;
