export interface PlayerProps<T extends Wheel.SoundtrackSource> {
  source: T;
  ref: React.RefObject<PlayerRef | null>;
  // Callbacks
  onReady?: () => void;
  onTimeUpdate?: (progress: number) => void;
}

export interface PlayerRef {
  play(offset: number): void;
  setVolume(volume: number): void;
  stop(): void;
}
