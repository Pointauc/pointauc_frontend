import React from 'react';
import { Paper } from '@material-ui/core';
import Options from '../Options/Options';
import '../AucPage/AucPage.scss';
import VideoRequest from '../VideoRequest/VideoRequest';

const VideoPointsPage: React.FC = () => {
  return (
    <Paper className="page-container" square>
      <div className="page-container-content centralize">
        <VideoRequest />
      </div>
      <Options />
    </Paper>
  );
};

export default VideoPointsPage;
