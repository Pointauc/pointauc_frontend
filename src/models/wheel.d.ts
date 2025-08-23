namespace Wheel {
  import { ReactNode } from 'react';

  import { SpinParams } from '@components/BaseWheel/BaseWheel.tsx';
  import { DropoutVariant } from '@components/BaseWheel/BaseWheel.tsx';
  import { WheelFormat } from '@constants/wheel.ts';
  import { RandomPaceConfig } from '@services/SpinPaceService.ts';
  import { WheelItem, ItemWithLabel, WheelItemWithAngle } from '@models/wheel.model.ts';

  interface Settings {
    spinTime: number | null;
    randomSpinConfig: { min: number; max: number };
    randomSpinEnabled: boolean;

    useRandomOrg: boolean;
    format: WheelFormat;
    paceConfig: RandomPaceConfig;
    split: number;

    maxDepth: number | null;
    depthRestriction: number | null;

    dropoutVariant: DropoutVariant;

    coreImage?: string | null;

    wheelStyles?: 'default' | 'genshinImpact' | null;
  }

  interface SettingControls {
    mode: boolean;
    split: boolean;
    randomPace: boolean;
    randomOrg: boolean;
    import: boolean;
  }

  interface FormatHook {
    init?: (items: WheelItem[]) => void;
    onSpinStart?: (initialSpinParams: SpinParams, wheelItems: WheelItemWithAngle[]) => Partial<SpinParams> | undefined;
    onSpinEnd?: (winner: WheelItem) => void | Promise<void>;
    calculateSpinDistance?: (seed?: number | null, duration?: number) => number;
    items: ItemWithLabel[];
    content?: ReactNode;
    renderSubmitButton?: (defaultButton: ReactNode) => ReactNode;
    extraSettings?: ReactNode;
  }
}
