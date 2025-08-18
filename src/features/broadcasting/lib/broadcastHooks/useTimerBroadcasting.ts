import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useRef } from 'react';

import { broadcastingControllerBroadcastTimerMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';
import { StopwatchController, StopwatchProps } from '@pages/auction/Stopwatch/Stopwatch';

type HookReturnType = Pick<StopwatchProps, 'onPause' | 'onStart' | 'onReset' | 'onTimeChanged' | 'onEnd'>;

export const useTimerBroadcasting = (): HookReturnType => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.timer);
  const controller = useRef<StopwatchController>(null);

  const { mutate: broadcastTimer } = useMutation({
    ...broadcastingControllerBroadcastTimerMutation(),
  });

  useEffect(() => {
    if (controller.current && isBroadcastEnabled) {
      broadcastTimer({
        body: { data: { timeLeft: controller.current.getTimeLeft(), state: controller.current.getState() } },
      });
    }
  }, [broadcastTimer, controller, isBroadcastEnabled]);

  return useMemo(() => {
    if (!isBroadcastEnabled) {
      return {};
    }

    return {
      onPause: (timeLeft: number) => {
        broadcastTimer({ body: { data: { timeLeft, state: 'paused' } } });
      },
      onStart: (timeLeft: number) => {
        broadcastTimer({ body: { data: { timeLeft, state: 'running' } } });
      },
      onReset: (timeLeft: number) => {
        broadcastTimer({ body: { data: { timeLeft, state: 'paused' } } });
      },
      onTimeChanged: (timeLeft: number, state: 'paused' | 'running') => {
        broadcastTimer({ body: { data: { timeLeft, state } } });
      },
      onEnd: () => {
        broadcastTimer({ body: { data: { timeLeft: 0, state: 'paused' } } });
      },
      controller,
    };
  }, [broadcastTimer, isBroadcastEnabled]);
};
