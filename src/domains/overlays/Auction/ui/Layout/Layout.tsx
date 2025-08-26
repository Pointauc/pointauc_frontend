import { FC, useEffect, useRef } from 'react';

import { Slot } from '@models/slot.model';
import Stopwatch, { StopwatchController } from '@pages/auction/Stopwatch/Stopwatch';
import OverlayThemeScope from '@shared/mantine/OverlayThemeScope';

import LotsColumn from '../LotsColumn';
import OverlayRules from '../OverlayRules';

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
  transparency?: number;
}

const Layout: FC<LayoutProps> = ({ lots, rules, timer, transparency }) => {
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
    <OverlayThemeScope className={classes.grid} backgroundTransparency={transparency}>
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
    </OverlayThemeScope>
  );
};

export default Layout;
