import { WAVEFORM_SAMPLES } from '../constants';

import type { AudioSourceAdapter } from './AudioSourceAdapter';

/**
 * Audio adapter for local audio files
 * Uses HTML5 Audio API for playback and Web Audio API for waveform extraction
 */
export class FileAudioAdapter implements AudioSourceAdapter<Wheel.SoundtrackSourceFile> {
  private audio: HTMLAudioElement | null = null;
  private source: Wheel.SoundtrackSourceFile | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;

  async load(source: Wheel.SoundtrackSourceFile): Promise<void> {
    this.source = source;

    // Create audio element
    this.audio = new Audio(source.dataUrl);
    this.audio.preload = 'auto';

    // Wait for audio to be loadable
    await new Promise<void>((resolve, reject) => {
      if (!this.audio) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      this.audio.addEventListener('loadedmetadata', () => resolve(), { once: true });
      this.audio.addEventListener('error', () => reject(new Error('Failed to load audio')), { once: true });
    });

    // Load audio buffer for waveform extraction
    await this.loadAudioBuffer(source.dataUrl);
  }

  private async loadAudioBuffer(dataUrl: string): Promise<void> {
    try {
      // Create audio context if not exists
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Convert data URL to array buffer
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load audio buffer for waveform:', error);
      // Continue without audio buffer - waveform will use fallback
    }
  }

  play(offset: number, volume: number): void {
    if (!this.audio) {
      console.error('Audio element not loaded');
      return;
    }

    this.audio.volume = volume;
    this.audio.currentTime = offset;
    this.audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
    });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  getDuration(): number {
    return this.audio?.duration ?? this.source?.duration ?? 0;
  }

  getCurrentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  /**
   * Extract real waveform from audio file using Web Audio API
   */
  async extractWaveform(): Promise<number[]> {
    if (!this.audioBuffer) {
      // Fallback to decorative waveform if buffer not available
      return this.generateDecorativeWaveform();
    }

    const channelData = this.audioBuffer.getChannelData(0); // Use first channel
    const samples = WAVEFORM_SAMPLES;
    const blockSize = Math.floor(channelData.length / samples);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let sum = 0;

      // Calculate RMS (Root Mean Square) for this block
      for (let j = start; j < end && j < channelData.length; j++) {
        sum += channelData[j] * channelData[j];
      }

      const rms = Math.sqrt(sum / blockSize);
      waveform.push(rms);
    }

    // Normalize to 0-1 range
    const max = Math.max(...waveform);
    return waveform.map((val) => (max > 0 ? val / max : 0));
  }

  private generateDecorativeWaveform(): number[] {
    // Generate pseudo-random waveform as fallback
    return Array.from({ length: WAVEFORM_SAMPLES }, (_, i) => {
      const x = Math.sin(i * 0.3) * 0.5 + 0.5;
      const y = Math.sin(i * 0.7) * 0.3 + 0.5;
      return Math.max(0.1, Math.min(1, (x + y) / 2));
    });
  }

  dispose(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.audioBuffer = null;
    this.source = null;
  }
}
