import { FC, ReactNode } from 'react';
import { Button } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import './StepWrapper.scss';

interface StepWrapperProps {
  backSteepTitle: string;
  onBackStep: () => void;
  className?: string;
  children?: ReactNode;
}

const StepWrapper: FC<StepWrapperProps> = ({ children, onBackStep, backSteepTitle, className }) => {
  return (
    <div className='step-wrapper'>
      <Button className='button' startIcon={<ArrowBackIosIcon />} onClick={onBackStep}>
        {backSteepTitle}
      </Button>
      <div className={className}>{children}</div>
    </div>
  );
};

export default StepWrapper;
