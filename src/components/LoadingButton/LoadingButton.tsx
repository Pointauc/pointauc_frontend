import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@material-ui/core';
import './LoadingButton.scss';

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ isLoading, children, ...buttonProps }) => {
  return (
    <Button {...buttonProps} disabled={isLoading || buttonProps.disabled}>
      {children}
      {isLoading && <CircularProgress size={30} className="button-loading" />}
    </Button>
  );
};

export default LoadingButton;
