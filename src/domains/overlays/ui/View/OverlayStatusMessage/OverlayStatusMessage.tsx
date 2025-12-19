import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './OverlayStatusMessage.module.css';

interface OverlayStatusMessageProps {
  messageKey: 'loading' | 'error' | 'waitingForWheelData' | 'waitingForAuctionData';
  type?: 'loading' | 'error' | 'info';
  delay?: number;
}

const OverlayStatusMessage: FC<OverlayStatusMessageProps> = ({ messageKey, type = 'info', delay = 400 }) => {
  const { t } = useTranslation();
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
      <div className={`${classes.message} ${classes[type]}`}>{t(`overlays.statusMessages.${messageKey}`)}</div>
    </div>
  );
};

export default OverlayStatusMessage;
