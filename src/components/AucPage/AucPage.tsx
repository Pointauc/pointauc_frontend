import React from 'react';
import { Paper } from '@material-ui/core';
import SlotsColumn from '../SlotsColumn/SlotsColumn';
import ControlColumn from '../ControlColumn/ControlColumn';
import Options from '../Options/Options';
import './AucPage.scss';

const AucPage: React.FC = () => {
  return (
    <Paper className="auc-page" square>
      <div className="auc-page-content">
        <SlotsColumn />
        <ControlColumn />
      </div>
      <Options />
    </Paper>
  );
};

export default AucPage;
