import React, { FC } from 'react';
import { Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './StepWrapper.scss';

interface StepWrapperProps {
  backSteepTitle: string;
  onBackStep: () => void;
  className?: string;
}

const StepWrapper: FC<StepWrapperProps> = ({ children, onBackStep, backSteepTitle, className }) => {
  return (
    <div className="step-wrapper">
      <Button className="button" startIcon={<ArrowBackIosIcon />} onClick={onBackStep}>
        {backSteepTitle}
      </Button>
      <div className={className}>{children}</div>
    </div>
  );
};

export default StepWrapper;
