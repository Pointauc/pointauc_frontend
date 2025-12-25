import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioSourceAdaperFactory, AudioSourceAdapter, createAudioAdapter } from './adapters/AudioSourceAdapter';

/**
 * Hook for managing audio playback for wheel soundtrack
 * Handles loading, playing, and cleanup of audio adapters
 */
export function useAudioPlayback(props: AudioSourceAdaperFactory) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const adapterRef = useRef<AudioSourceAdapter | null>(null);
  const { source } = props;

  useEffect(() => {
    if (!source) {
      // Clean up if no source
      if (adapterRef.current) {
        adapterRef.current.dispose();
        adapterRef.current = null;
      }
      return;
    }

    // Load new source
    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Dispose old adapter if exists
        if (adapterRef.current) {
          adapterRef.current.dispose();
        }

        // Create and load new adapter
        const adapter = createAudioAdapter(props);
        await adapter.load(source);
        adapterRef.current = adapter;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load audio'));
        console.error('Failed to load audio:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    // Cleanup on unmount or source change
    return () => {
      if (adapterRef.current) {
        adapterRef.current.dispose();
        adapterRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const play = useCallback(
    (offset: number, volume: number) => {
      if (adapterRef.current) {
        adapterRef.current.play(offset, volume);
      }
    },
    [adapterRef],
  );

  const stop = useCallback(() => {
    if (adapterRef.current) {
      adapterRef.current.stop();
    }
  }, [adapterRef]);

  const extractWaveform = useCallback(async (): Promise<number[]> => {
    if (!adapterRef.current) {
      return [];
    }
    return adapterRef.current.extractWaveform();
  }, [adapterRef]);

  const getCurrentTime = useCallback((): number => {
    if (!adapterRef.current) {
      return 0;
    }
    return adapterRef.current.getCurrentTime();
  }, [adapterRef]);

  useEffect(() => {
    if (!source || isLoading) {
      setWaveform([]);
      return;
    }

    const extract = async () => {
      setIsExtracting(true);
      try {
        const waveformData = await extractWaveform();
        setWaveform(waveformData);
      } catch (error) {
        console.error('Failed to extract waveform:', error);
        setWaveform([]);
      } finally {
        setIsExtracting(false);
      }
    };

    extract();
  }, [source, isLoading, extractWaveform]);

  return {
    isLoading,
    error,
    play,
    stop,
    extractWaveform,
    getCurrentTime,
    adapter: adapterRef.current,
    waveform,
    isExtracting,
  };
}
