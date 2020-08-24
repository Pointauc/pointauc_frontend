import React from 'react';
import { Paper } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SlotsColumn from '../SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Options from '../Options/Options';
import './AucPage.scss';
import Notification from '../Notification/Notification';

const AucPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Paper className="page-container" square>
        <div className="page-container-content">
          <SlotsColumn />
          <ControlColumn />
        </div>
        <Options />
        <Notification />
      </Paper>
    </DndProvider>
  );
};

export default AucPage;
