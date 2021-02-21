import React, { FC, useEffect } from 'react';
import { Alert } from '@material-ui/lab';
import { useDispatch } from 'react-redux';
import { AlertType } from '../../../models/alert.model';
import { deleteAlert } from '../../../reducers/notifications/notifications';
import { ALERT_LIFETIME } from '../../../constants/common.constants';

const BaseAlert: FC<AlertType> = ({ id, type, message, duration }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => dispatch(deleteAlert(id)), duration || ALERT_LIFETIME);

    return (): void => clearTimeout(timeout);
  }, [dispatch, duration, id]);

  return (
    <Alert severity={type} variant="filled">
      {message}
    </Alert>
  );
};

export default BaseAlert;
