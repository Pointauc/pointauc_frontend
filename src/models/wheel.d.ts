namespace Wheel {
  import { ReactNode } from 'react';
  import { ButtonProps } from '@mantine/core';

  import { SpinParams } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel.tsx';
  import { DropoutVariant } from '@domains/winner-selection/wheel-of-random/BaseWheel/BaseWheel.tsx';
  import { WheelFormat } from '@constants/wheel.ts';
  import { RandomPaceConfig } from '@services/SpinPaceService.ts';
  import { WheelItem, ItemWithLabel, WheelItemWithAngle } from '@models/wheel.model.ts';

  /** YouTube video as audio source */
  interface SoundtrackSourceYoutube {
    type: 'youtube';
    videoId: string;
    title: string;
    channelTitle: string;
    duration: number; // seconds
    thumbnailUrl: string;
  }

  /** Local audio file as source */
  interface SoundtrackSourceFile {
    type: 'file';
    /** Base64 data URL for persistence in IndexedDB */
    dataUrl: string;
    fileName: string;
    /** MIME type (audio/mp3, audio/wav, etc.) */
    mimeType: string;
    duration: number; // seconds
    /** File size in bytes for display */
    fileSize: number;
  }

  /** Discriminated union - enables type-safe handling per source type */
  type SoundtrackSource = SoundtrackSourceYoutube | SoundtrackSourceFile;

  interface SoundtrackConfig {
    enabled: boolean;
    source: SoundtrackSource | null;
    /** Start position in seconds - where in the track to begin playback */
    offset: number;
    /** Volume level 0-1 */
    volume: number;
    /** Cached waveform peaks (0-1 normalized) for timeline visualization */
    waveformData?: number[];
  }

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

    soundtrack?: SoundtrackConfig;
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
