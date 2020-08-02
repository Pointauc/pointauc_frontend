import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Backdrop } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { RootState } from '../../reducers';
import { setNotification } from '../../reducers/notifications/notifications';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
      fontSize: '45px',
    },
  }),
);

const Notification: React.FC = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { message } = useSelector((root: RootState) => root.notifications);

  const handleClose = (): void => {
    dispatch(setNotification(null));
  };

  return (
    <Backdrop open={!!message} onClick={handleClose} className={classes.backdrop}>
      {message}
    </Backdrop>
  );
};

export default Notification;
