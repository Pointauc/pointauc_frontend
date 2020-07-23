import React, { useEffect } from 'react';
import './Options.scss';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Paper } from '@material-ui/core';
import TwitchLogin from '../TwitchLogin/TwitchLogin';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';

const Options: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const username = Cookies.get(USERNAME_COOKIE_KEY);
    if (username) {
      dispatch(setUsername(username));
    }
  }, [dispatch]);

  return (
    <Paper variant="outlined" className="options">
      <TwitchLogin />
    </Paper>
  );
};

export default Options;
