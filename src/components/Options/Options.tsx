import React, { useEffect } from 'react';
import './Options.scss';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { Button, IconButton } from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { setUsername } from '../../reducers/User/User';
import { USERNAME_COOKIE_KEY } from '../../constants/common.constants';
import { resetSlots } from '../../reducers/Slots/Slots';
import { resetPurchases } from '../../reducers/Purchases/Purchases';
import { isProduction } from '../../utils/common.utils';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { RootState } from '../../reducers';

const isProd = isProduction();

const Options: React.FC = () => {
  const dispatch = useDispatch();
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

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

  const requestMockData = (): void => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.MOCK_PURCHASE }));
    }
  };

  return (
    <div className="options">
      <IconButton onClick={handleResetSlots} className="options-button" title="Очистить все">
        <DeleteSweepIcon />
      </IconButton>
      {!isProd && (
        <Button color="primary" onClick={requestMockData}>
          Get mock
        </Button>
      )}
    </div>
  );
};

export default Options;
