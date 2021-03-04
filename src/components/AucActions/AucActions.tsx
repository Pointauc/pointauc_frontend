import React, { useEffect } from 'react';
import './AucActions.scss';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { Button, IconButton } from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { setUsername } from '../../reducers/User/User';
import { LINE_BREAK, USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots } from '../../reducers/Slots/Slots';
import { resetPurchases } from '../../reducers/Purchases/Purchases';
import { isProduction, loadFile } from '../../utils/common.utils';
import { RootState } from '../../reducers';
import ServerStatus from '../ServerStatus/ServerStatus';
import { Slot } from '../../models/slot.model';
import MockBidForm from './MockBidForm/MockBidForm';

const isProd = isProduction();

const getSlotNamesByCount = ({ name, amount }: Slot): string =>
  new Array<string>(Number(amount)).fill(name || '').join(LINE_BREAK);
const createMarbleConfig = (slots: Slot[]): string => slots.map(getSlotNamesByCount).join(LINE_BREAK);

const AucActions: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((root: RootState) => root.slots);

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

  const downloadMarbles = (): void => {
    loadFile('marbles.csv', createMarbleConfig(slots));
  };

  return (
    <div className="options">
      <IconButton onClick={handleResetSlots} className="options-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      <ServerStatus />
      <Button onClick={downloadMarbles}>Скачать шары</Button>
      {!isProd && <MockBidForm />}
    </div>
  );
};

export default AucActions;
