import { FC, useCallback, useEffect } from 'react';
import { Alert } from '@mui/lab';
import { useDispatch } from 'react-redux';

import { AlertType } from '@models/alert.model.ts';
import { deleteAlert } from '@reducers/notifications/notifications.ts';
import { ALERT_LIFETIME } from '@constants/common.constants.ts';

const BaseAlert: FC<AlertType> = ({ id, type, message, duration, closable }) => {
  const dispatch = useDispatch();

  const closeAlert = useCallback(() => {
    dispatch(deleteAlert(id));
  }, [dispatch, id]);

  useEffect(() => {
    const timeout = setTimeout(() => closeAlert(), duration || ALERT_LIFETIME);

    return (): void => clearTimeout(timeout);
  }, [closeAlert, dispatch, duration, id]);

  return (
    <Alert severity={type} variant='filled' onClose={closable ? closeAlert : undefined}>
      {message}
    </Alert>
  );
};

export default BaseAlert;
