import React, { ReactNode, useEffect, useState } from 'react';
import './Options.scss';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots } from '../../reducers/Slots/Slots';

interface OptionsProps {
  settingsComponent?: ReactNode;
}

const Options: React.FC<OptionsProps> = ({ settingsComponent }) => {
  const dispatch = useDispatch();
  const [isSettingsOpened, setIsSettingsOpened] = useState(false);

  const toggleSettings = (): void => {
    setIsSettingsOpened((prevOpenedState) => !prevOpenedState);
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
      <Dialog open={isSettingsOpened} onClose={toggleSettings} fullWidth maxWidth="sm">
        <DialogTitle>Настройки</DialogTitle>
        <DialogContent>{settingsComponent}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={toggleSettings} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={handleResetSlots} className="options-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      <IconButton onClick={toggleSettings} className="options-button" title="Настройки">
        <SettingsIcon />
      </IconButton>
    </div>
  );
};

export default Options;
