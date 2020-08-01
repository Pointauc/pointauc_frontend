import React, { MouseEvent, ReactNode, useEffect } from 'react';
import './Options.scss';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Fade, IconButton, Paper, Popper } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import TwitchLogin from '../TwitchLogin/TwitchLogin';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';

const Options: React.FC = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const toggleOptions = (e: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(anchorEl ? null : e.currentTarget);
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    const username = Cookies.get(USERNAME_COOKIE_KEY);
    if (username) {
      dispatch(setUsername(username));
    }
  }, [dispatch]);

  return (
    <div className="options">
      <Popper keepMounted open={open} anchorEl={anchorEl} placement="top" transition>
        {({ TransitionProps }): ReactNode => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper variant="outlined" className="options-menu">
              <TwitchLogin />
            </Paper>
          </Fade>
        )}
      </Popper>
      <IconButton onClick={toggleOptions}>
        <SettingsIcon />
      </IconButton>
    </div>
  );
};

export default Options;
