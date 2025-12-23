import PlayerFactory from 'youtube-player';
import { YouTubePlayer } from 'youtube-player/dist/types';

import { WAVEFORM_SAMPLES } from '../constants';

import type { AudioSourceAdapter, AudioSourceAdapterProps } from './AudioSourceAdapter';

/**
 * Audio adapter for YouTube videos
 * Uses youtube-player library to play video as audio source
 */
export class YouTubeAudioAdapter implements AudioSourceAdapter<Wheel.SoundtrackSourceYoutube> {
  private player: YouTubePlayer | null = null;
  private container: HTMLDivElement | null = null;
  private source: Wheel.SoundtrackSourceYoutube | null = null;
  private onPlaybackProgress?: (progress: number) => void;

  constructor(props: AudioSourceAdapterProps) {
    this.onPlaybackProgress = props.onPlaybackProgress;
  }

  async load(source: Wheel.SoundtrackSourceYoutube): Promise<void> {
    this.source = source;

    // Create hidden container for YouTube player
    // if (!this.container) {
    //   this.container = document.createElement('div');
    //   this.container.style.position = 'absolute';
    //   this.container.style.left = '-9999px';
    //   this.container.style.width = '1px';
    //   this.container.style.height = '1px';
    //   document.body.appendChild(this.container);
    // }

    // Initialize YouTube player
    // this.player = PlayerFactory(this.container, {
    //   videoId: source.videoId,
    //   width: 1,
    //   height: 1,
    //   playerVars: {
    //     controls: 0,
    //     disablekb: 1,
    //     fs: 0,
    //     modestbranding: 1,
    //   },
    // });

    // this.player.on('stateChange', (event: any) => {
    //   console.log(event);
    // });

    // Wait for player to be ready
    // await this.player.cueVideoById(source.videoId);
  }

  play(offset: number, volume: number): void {
    if (!this.player) {
      console.error('YouTube player not loaded');
      return;
    }

    this.player.setVolume(volume * 100);
    this.player.seekTo(offset, true);
    this.player.playVideo();
  }

  stop(): void {
    if (this.player) {
      this.player.pauseVideo();
    }
  }

  getDuration(): number {
    return this.source?.duration ?? 0;
  }

  getCurrentTime(): number {
    if (!this.player) {
      return 0;
    }
    // Note: getCurrentTime returns a Promise, but we need sync access
    // This will be handled by polling in the hook
    return 0;
  }

  /**
   * Extract waveform from YouTube video
   * Note: Due to CORS restrictions, we generate a decorative waveform
   * Real waveform extraction from YouTube is blocked by browser security
   */
  async extractWaveform(): Promise<number[]> {
    // Generate pseudo-random but consistent waveform based on videoId
    const videoId = this.source?.videoId ?? '';
    const seed = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return Array.from({ length: WAVEFORM_SAMPLES }, (_, i) => {
      // Use seeded pseudo-random for consistent waveforms
      const x = Math.sin(seed + i * 0.5) * 0.5 + 0.5;
      const y = Math.sin(seed + i * 0.7) * 0.3 + 0.5;
      return Math.max(0.1, Math.min(1, (x + y) / 2));
    });
  }

  dispose(): void {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }

    this.source = null;
  }
}
