import { RandomPaceConfig } from '@services/SpinPaceService';
import { Option } from '@components/RadioButtonGroup/RadioButtonGroup';

export enum WheelCommand {
  OpenReg = 'openReg',
  CloseReg = 'closeReg',
  Spin = 'spin',
  Join = 'join',
}

export const CHAT_WHEEL_PREFIX = '!w';

export const SPIN_PATH = 'M0,0,C0.102,0.044,0.171,0.365,0.212,0.542,0.344,0.988,0.808,1,1,1';

export const PACE_PRESETS: Record<string, RandomPaceConfig> = {
  suddenFinal: {
    allowBackStep: true,
    valueRandomZone: 600,
    xRandomZone: 0.1,
    valueDisabledZone: 0.4,
    randomOffset: 1,
    points: 0,
  },
};

export enum WheelFormat {
  Default,
  Dropout,
  BattleRoyal,
}

export enum GroupStage {
  FFA,
  Teams,
  Dropout,
}

export const GROUP_STAGES: Option<GroupStage>[] = [
  { key: GroupStage.FFA, label: 'FFA' },
  { key: GroupStage.Teams, label: 'Команды' },
  { key: GroupStage.Dropout, label: 'Выбывание' },
];
