import React from 'react';
import { CircularProgress } from '@material-ui/core';
import './LoadingPage.scss';

interface LoadingPageProps {
  helpText?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ helpText }) => {
  return (
    <div className="loading-page">
      <CircularProgress className="loading-page-spinner" />
      {!!helpText && <div>{helpText}</div>}
    </div>
  );
};

export default LoadingPage;
