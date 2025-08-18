import { FC, useEffect, useRef } from 'react';
import { Grid } from '@mantine/core';
import { useDispatch } from 'react-redux';

import { Slot } from '@models/slot.model';
import useAutoScroll from '@hooks/useAutoScroll';
import RulesComponent from '@pages/auction/Rules/Rules';
import Stopwatch, { StopwatchController } from '@pages/auction/Stopwatch/Stopwatch';
import { setDarkAlpha } from '@reducers/Overlay/Overlay';

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
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(setDarkAlpha(darkAlpha));
  // }, [darkAlpha, dispatch]);

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
          <RulesComponent />
        </Grid.Col>
      )}
      {lots && (
        <Grid.Col span='auto'>
          <LotsColumn items={lots.items} autoScroll={lots.autoScroll} scrollSpeed={lots.scrollSpeed} />
        </Grid.Col>
      )}
      {timer && (
        <Grid.Col span='content'>
          <Stopwatch controller={timerController} />
        </Grid.Col>
      )}
    </Grid>
  );
};

export default Layout;
