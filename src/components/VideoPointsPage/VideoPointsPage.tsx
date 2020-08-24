import React from 'react';
import { Paper } from '@material-ui/core';
import Options from '../Options/Options';
import '../AucPage/AucPage.scss';

const VideoPointsPage: React.FC = () => {
  return (
    <Paper className="page-container" square>
      <Options />
    </Paper>
  );
};

export default VideoPointsPage;
