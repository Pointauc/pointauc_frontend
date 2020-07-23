import React from 'react';
import { Paper } from '@material-ui/core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import SlotsColumn from '../SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Options from '../Options/Options';
import './AucPage.scss';

const AucPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Paper className="auc-page" square>
        <div className="auc-page-content">
          <SlotsColumn />
          <ControlColumn />
        </div>
        <Options />
      </Paper>
    </DndProvider>
  );
};

export default AucPage;
