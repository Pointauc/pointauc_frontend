import { FC, useEffect, useState } from 'react';

import classes from './OverlayStatusMessage.module.css';

interface OverlayStatusMessageProps {
  message: string;
  type?: 'loading' | 'error' | 'info';
  delay?: number;
}

const OverlayStatusMessage: FC<OverlayStatusMessageProps> = ({ message, type = 'info', delay = 400 }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div className={`${classes.message} ${classes[type]}`}>{message}</div>
    </div>
  );
};

export default OverlayStatusMessage;
