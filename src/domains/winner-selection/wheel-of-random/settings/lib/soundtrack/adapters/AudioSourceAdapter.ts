import { FileAudioAdapter } from './FileAudioAdapter';
import { YouTubeAudioAdapter } from './YouTubeAudioAdapter';

/**
 * Common interface for all audio source adapters
 * Enables strategy pattern for different audio sources (YouTube, File, etc.)
 */
export interface AudioSourceAdapter<T extends Wheel.SoundtrackSource = Wheel.SoundtrackSource> {
  /** Load audio from the provided source configuration */
  load(source: T): Promise<void>;

  /** Start playback at given offset (seconds) with volume (0-1) */
  play(offset: number, volume: number): void;

  /** Stop playback immediately */
  stop(): void;

  /** Get total audio duration in seconds */
  getDuration(): number;

  /** Get current playback time in seconds */
  getCurrentTime(): number;

  /** Extract waveform peaks for visualization (0-1 normalized) */
  extractWaveform(): Promise<number[]>;

  /** Clean up resources (player instances, audio contexts) */
  dispose(): void;
}

export interface AudioSourceAdapterProps {
  onPlaybackProgress?: (progress: number) => void;
}

export interface AudioSourceAdaperFactory extends AudioSourceAdapterProps {
  source: Wheel.SoundtrackSourceYoutube;
}

/**
 * Factory function to create appropriate adapter based on source type
 */
export function createAudioAdapter({ source, ...props }: AudioSourceAdaperFactory): AudioSourceAdapter {
  if (source.type === 'youtube') {
    // Dynamic import to avoid circular dependencies
    return new YouTubeAudioAdapter(props);
  } else {
    return new FileAudioAdapter();
  }
}
