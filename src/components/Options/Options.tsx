import React, { ReactNode, useEffect, useState } from 'react';
import './Options.scss';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import AssignmentIcon from '@material-ui/icons/Assignment';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots } from '../../reducers/Slots/Slots';
import { resetPurchases } from '../../reducers/Purchases/Purchases';
import Wheel from '../AucPage/Wheel/Wheel';

interface OptionsProps {
  historyComponent?: ReactNode;
}

const Options: React.FC<OptionsProps> = ({ historyComponent }) => {
  const dispatch = useDispatch();
  const [isHistoryOpened, setIsHistoryOpened] = useState(false);
  const [isWheelOpened, setIsWheelOpened] = useState(false);

  const toggleHistory = (): void => {
    setIsHistoryOpened((prevOpenedState) => !prevOpenedState);
  };

  const toggleWheel = (): void => {
    setIsWheelOpened((prevOpenedState) => !prevOpenedState);
  };

  const handleResetSlots = (): void => {
    dispatch(resetSlots());
    dispatch(resetPurchases());
  };

  useEffect(() => {
    const username = Cookies.get(USERNAME_COOKIE_KEY);
    if (username) {
      dispatch(setUsername(username));
    }
  }, [dispatch]);

  return (
    <div className="options">
      <Dialog open={isHistoryOpened} onClose={toggleHistory} fullWidth maxWidth="md">
        <DialogTitle>История</DialogTitle>
        <DialogContent>{historyComponent}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={toggleHistory} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isWheelOpened} onClose={toggleWheel} maxWidth="md">
        <DialogTitle>Wheel of decide</DialogTitle>
        <DialogContent>
          <Wheel />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={toggleWheel} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton onClick={handleResetSlots} className="options-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      <IconButton onClick={toggleWheel} className="options-button" title="Wheel">
        <QueryBuilderIcon />
      </IconButton>
      <IconButton onClick={toggleHistory} className="options-button" title="История">
        <AssignmentIcon />
      </IconButton>
    </div>
  );
};

export default Options;
