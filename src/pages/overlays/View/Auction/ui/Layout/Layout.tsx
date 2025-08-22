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
    <Grid classNames={{ inner: classes.grid }} gutter='0'>
      {rules && (
        <Grid.Col span='content'>
          <OverlayRules rules={rules.rules} />
        </Grid.Col>
      )}
      {lots && (
        <Grid.Col span='auto'>
          <LotsColumn items={lots.items} autoScroll={lots.autoScroll} scrollSpeed={lots.scrollSpeed} />
        </Grid.Col>
      )}
      {timer && (
        <Grid.Col span='content'>
          <Stopwatch controller={timerController} showControls={false} />
        </Grid.Col>
      )}
    </Grid>
  );
};

export default Layout;
