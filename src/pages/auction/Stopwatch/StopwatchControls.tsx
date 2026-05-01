import { ActionIcon, Group } from '@mantine/core';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ROUTES from '@constants/routes.constants';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import HotkeyTooltip from '@shared/ui/HotkeyTooltip/HotkeyTooltip';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';

import classes from './Stopwatch.module.css';

interface StopwatchControlsProps {
  checkIsStopped: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddTime: () => void;
  onSubtractTime: () => void;
  onAddDoubleTime: () => void;
  onControlButtonClick?: (buttonName: string) => void;
}

const StopwatchControls: FC<StopwatchControlsProps> = ({
  checkIsStopped,
  onStart,
  onStop,
  onReset,
  onAddTime,
  onSubtractTime,
  onAddDoubleTime,
  onControlButtonClick,
}) => {
  const { t } = useTranslation();

  useAppHotkey(
    HOTKEY_ACTION_IDS.stopwatchToggle,
    (event, { setNotificationData }) => {
      event.preventDefault();

      if (checkIsStopped) {
        onStart();
        setNotificationData({ state: 'continue' });
        return;
      }

      onStop();
      setNotificationData({ state: 'pause' });
    },
    { preventDefault: true },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.stopwatchAddTime,
    (event) => {
      event.preventDefault();
      onAddTime();
    },
    { preventDefault: true },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.stopwatchSubtractTime,
    (event) => {
      event.preventDefault();
      onSubtractTime();
    },
    { preventDefault: true },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.stopwatchAddTimeDouble,
    (event) => {
      event.preventDefault();
      onAddDoubleTime();
    },
    { preventDefault: true },
  );

  return (
    <Group className={classes.controls} gap='xs'>
      <HotkeyTooltip
        actionId={HOTKEY_ACTION_IDS.stopwatchToggle}
        showLabel={false}
        visibleOnRoutes={[ROUTES.HOME]}
        position='bottom'
      >
        {checkIsStopped ? (
          <ActionIcon
            color='gray.0'
            onClick={() => {
              onControlButtonClick?.('toggle');
              onStart();
            }}
            title={t('stopwatch.continue')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <PlayArrowIcon fontSize='large' />
          </ActionIcon>
        ) : (
          <ActionIcon
            color='gray.0'
            onClick={() => {
              onControlButtonClick?.('toggle');
              onStop();
            }}
            title={t('stopwatch.pause')}
            size='xl'
            variant='subtle'
            radius='xl'
            className={classes.actionIcon}
          >
            <PauseIcon fontSize='large' />
          </ActionIcon>
        )}
      </HotkeyTooltip>
      <ActionIcon
        color='gray.0'
        onClick={() => {
          onControlButtonClick?.('reset');
          onReset();
        }}
        title={t('stopwatch.reset')}
        size='xl'
        variant='subtle'
        radius='xl'
        className={classes.actionIcon}
      >
        <ReplayIcon fontSize='large' />
      </ActionIcon>
      <HotkeyTooltip
        actionId={HOTKEY_ACTION_IDS.stopwatchAddTime}
        showLabel={false}
        visibleOnRoutes={[ROUTES.HOME]}
        position='bottom'
      >
        <ActionIcon
          color='gray.0'
          onClick={() => {
            onControlButtonClick?.('addTime');
            onAddTime();
          }}
          title={t('stopwatch.addTime')}
          size='xl'
          variant='subtle'
          radius='xl'
          className={classes.actionIcon}
        >
          <ExpandLessIcon fontSize='large' />
        </ActionIcon>
      </HotkeyTooltip>
      <HotkeyTooltip
        actionId={HOTKEY_ACTION_IDS.stopwatchSubtractTime}
        showLabel={false}
        visibleOnRoutes={[ROUTES.HOME]}
        position='bottom'
      >
        <ActionIcon
          color='gray.0'
          onClick={() => {
            onControlButtonClick?.('subtractTime');
            onSubtractTime();
          }}
          title={t('stopwatch.reduceTime')}
          size='xl'
          variant='subtle'
          radius='xl'
          className={classes.actionIcon}
        >
          <ExpandMoreIcon fontSize='large' />
        </ActionIcon>
      </HotkeyTooltip>
      <HotkeyTooltip
        actionId={HOTKEY_ACTION_IDS.stopwatchAddTimeDouble}
        showLabel={false}
        visibleOnRoutes={[ROUTES.HOME]}
        position='bottom'
      >
        <ActionIcon
          color='gray.0'
          onClick={() => {
            onControlButtonClick?.('addDoubleTime');
            onAddDoubleTime();
          }}
          title={t('stopwatch.addTimex2')}
          size='xl'
          variant='subtle'
          radius='xl'
          className={classes.actionIcon}
        >
          <KeyboardCapslockIcon fontSize='large' />
        </ActionIcon>
      </HotkeyTooltip>
    </Group>
  );
};

export default memo(StopwatchControls);
