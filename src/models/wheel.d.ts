namespace Wheel {
  import { ReactNode } from 'react';
  import { ButtonProps } from '@mantine/core';

  import { SpinParams } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel.tsx';
  import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel.tsx';
  import { WheelFormat } from '@constants/wheel.ts';
  import { RandomPaceConfig } from '@services/SpinPaceService.ts';
  import { WheelItem, ItemWithLabel, WheelItemWithAngle } from '@models/wheel.model.ts';

  interface Settings {
    spinTime: number | null;
    randomSpinConfig: { min: number; max: number };
    randomSpinEnabled: boolean;

    randomnessSource: 'local-basic' | 'random-org' | 'random-org-signed';
    format: WheelFormat;
    paceConfig: RandomPaceConfig;
    split: number;

    maxDepth: number | null;
    depthRestriction: number | null;

    dropoutVariant: DropoutVariant;

    coreImage?: string | null;

    wheelStyles?: 'default' | 'genshinImpact' | null;

    showDeleteConfirmation?: boolean;
  }

  interface SettingControls {
    mode: boolean;
    split: boolean;
    randomPace: boolean;
    randomOrg: boolean;
    import: boolean;
  }

  export interface GetNextWinnerIdParams {
    generateSeed: () => Promise<number> | number;
    items: WheelItemWithAngle[];
  }

  export interface GetNextWinnerIdResult {
    id: string | number;
    isFinalSpin: boolean;
  }

  interface FormatHook {
    init?: (items: WheelItem[]) => void;
    getNextWinnerId: (spinParams: GetNextWinnerIdParams) => Promise<GetNextWinnerIdResult> | GetNextWinnerIdResult;
    onSpinEnd?: (winner: WheelItem) => void | Promise<void>;
    calculateSpinDistance?: (seed?: number | null, duration?: number) => number;
    items: ItemWithLabel[];
    content?: ReactNode;
    renderSubmitButton?: (defaultButton: ReactNode) => ReactNode;
    extraSettings?: ReactNode;
  }
}
