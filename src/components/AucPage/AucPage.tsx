import React, { useCallback, useEffect } from 'react';
import { Paper } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';
import { RootState } from '../../reducers';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { getAucSettings } from '../../api/userApi';
import { setAucSettings } from '../../reducers/AucSettings/AucSettings';

const AucPage: React.FC = () => {
  const dispatch = useDispatch();
  const { background, aucRewardPrefix } = useSelector((root: RootState) => root.aucSettings.settings);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

  useEffect(() => {
    if (webSocket && aucRewardPrefix) {
      webSocket.send(JSON.stringify({ type: MESSAGE_TYPES.SET_AUC_REWARD_PREFIX, rewardPrefix: aucRewardPrefix }));
    }
  }, [aucRewardPrefix, webSocket]);

  const loadUserSettings = useCallback(async () => {
    const userSettings = await getAucSettings();

    dispatch(setAucSettings(userSettings));
  }, [dispatch]);

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper className="page-container" square style={backgroundStyles}>
        <div className="page-container-content">
          <SlotsColumn />
          <ControlColumn />
        </div>
        <Notification />
      </Paper>
    </DndProvider>
  );
};

export default AucPage;
