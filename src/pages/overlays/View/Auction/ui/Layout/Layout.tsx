import { Grid } from '@mantine/core';
import { FC, useEffect, useRef } from 'react';

import { Slot } from '@models/slot.model';
import Stopwatch, { StopwatchController } from '@pages/auction/Stopwatch/Stopwatch';

import OverlayRules from '../OverlayRules';
import LotsColumn from '../LotsColumn';

import classes from './Layout.module.css';

interface LotsProps {
  items: Slot[];
  autoScroll: boolean;
  scrollSpeed: number;
}

interface RulesProps {
  rules: string;
}

export interface TimerProps {
  state: 'paused' | 'running';
  timeLeft: number;
}

interface LayoutProps {
  lots?: LotsProps;
  rules?: RulesProps;
  timer?: TimerProps;
  darkAlpha?: number | null;
}

const Layout: FC<LayoutProps> = ({ lots, rules, timer, darkAlpha }) => {
  const timerController = useRef<StopwatchController | null>(null);

  useEffect(() => {
    if (timerController.current && timer?.timeLeft !== undefined) {
      timerController.current.setTime(timer.timeLeft);

      if (timer.state === 'running') {
        timerController.current.start();
      } else {
        timerController.current.stop();
      }
    }
  }, [timer?.state, timer?.timeLeft]);

  return (
    <div className={classes.grid}>
      {rules && (
        <div className={classes.rules}>
          <OverlayRules rules={rules.rules} />
        </div>
      )}
      {lots && (
        <div className={classes.lots}>
          <LotsColumn items={lots.items} autoScroll={lots.autoScroll} scrollSpeed={lots.scrollSpeed} />
        </div>
      )}
      {timer && (
        <div className={classes.timer}>
          <Stopwatch controller={timerController} showControls={false} />
        </div>
      )}
    </div>
  );
};

export default Layout;
