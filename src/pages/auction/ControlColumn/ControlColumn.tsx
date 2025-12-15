import { Box } from '@mantine/core';

import { useTimerBroadcasting } from '@domains/broadcasting/lib/useTimerBroadcasting';
import { useIsMobile } from '@shared/lib/ui';

import Stopwatch from '../Stopwatch/Stopwatch';
import PurchaseList from '../PurchaseList/PurchaseList';
import FastAccessPanel from '../FastAccessPanel/FastAccessPanel';

import classes from './ControlColumn.module.css';

const ControlColumn: React.FC = () => {
  const timerProps = useTimerBroadcasting();
  const isMobile = useIsMobile();

  return (
    <div className={classes.controlColumn}>
      <Stopwatch {...timerProps} />
      {!isMobile && (
        <>
          <FastAccessPanel />
          <PurchaseList />
        </>
      )}
    </div>
  );
};

export default ControlColumn;
