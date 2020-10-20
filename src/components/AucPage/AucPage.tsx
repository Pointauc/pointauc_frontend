import React from 'react';
import { Paper } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SlotsColumn from './SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Notification from '../Notification/Notification';
import './AucPage.scss';

const AucPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Paper className="page-container" square>
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
