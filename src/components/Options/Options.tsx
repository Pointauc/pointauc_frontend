import React, { useEffect, useState } from 'react';
import './Options.scss';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Fade, IconButton, Paper } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import TwitchLogin from '../TwitchLogin/TwitchLogin';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots } from '../../reducers/Slots/Slots';

const Options: React.FC = () => {
  const dispatch = useDispatch();
  const [isOptionsOpened, setIsOptionsOpened] = useState(false);

  const toggleOptions = (): void => {
    setIsOptionsOpened((prevOpenedState) => !prevOpenedState);
  };

  const handleResetSlots = (): void => {
    dispatch(resetSlots());
  };

  useEffect(() => {
    const username = Cookies.get(USERNAME_COOKIE_KEY);
    if (username) {
      dispatch(setUsername(username));
    }
  }, [dispatch]);

  return (
    <div className="options">
      <Fade in={isOptionsOpened} timeout={300}>
        <Paper variant="outlined" className="options-menu">
          <TwitchLogin />
        </Paper>
      </Fade>
      <IconButton onClick={handleResetSlots} className="options-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      <IconButton onClick={toggleOptions} className="options-button" title="Настройки">
        <SettingsIcon />
      </IconButton>
    </div>
  );
};

export default Options;
