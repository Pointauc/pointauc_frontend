export interface PlayerProps<T extends Wheel.SoundtrackSource> {
  source: T;
  ref: React.RefObject<PlayerRef | null>;
  //props
  displayAs?: 'thumbnail' | 'hidden';
  // Callbacks
  onReady?: () => void;
  onTimeUpdate?: (progress: number) => void;
}

export interface PlayerRef {
  play(offset: number, volume: number): void;
  setVolume(volume: number): void;
  stop(): void;
}
