import React from 'react';
import { Paper } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useSelector } from 'react-redux';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';
import { RootState } from '../../reducers';

const AucPage: React.FC = () => {
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);

  const backgroundStyles = {
    backgroundImage: `url(${background})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };

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
