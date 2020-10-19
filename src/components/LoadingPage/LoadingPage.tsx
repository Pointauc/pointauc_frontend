import React from 'react';
import { CircularProgress } from '@material-ui/core';
import './LoadingPage.scss';

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-page">
      <CircularProgress className="loading-page-spinner" />
    </div>
  );
};

export default LoadingPage;
