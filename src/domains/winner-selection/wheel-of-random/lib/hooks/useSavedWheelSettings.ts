import { useEffect, useMemo } from 'react';

import { PACE_PRESETS, WheelFormat } from '@constants/wheel';

import { DropoutVariant } from '../../BaseWheel/BaseWheel';

export const defaultWheelSettings: Wheel.Settings = {
  spinTime: 20,
  randomSpinConfig: { min: 20, max: 100 },
  randomSpinEnabled: false,

  randomnessSource: 'local-basic',
  format: WheelFormat.Default,
  paceConfig: PACE_PRESETS.suddenFinal,
  split: 1,
  coreImage: localStorage.getItem('wheelEmote'),

  maxDepth: null,
  depthRestriction: null,

  dropoutVariant: DropoutVariant.New,
  wheelStyles: 'default',
  showDeleteConfirmation: true,
};

export const useSavedWheelSettings = () => {
  return useMemo((): Wheel.Settings => {
    const savedSettings = JSON.parse(localStorage.getItem('wheelSettings') ?? '{}');
    return { ...defaultWheelSettings, ...savedSettings };
  }, []);
};
