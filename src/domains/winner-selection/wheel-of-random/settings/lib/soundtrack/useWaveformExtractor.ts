import { useEffect, useState } from 'react';

import { useAudioPlayback } from './useAudioPlayback';

/**
 * Hook for extracting waveform data from audio sources
 * Automatically extracts when source changes
 */
export function useWaveformExtractor(source: Wheel.SoundtrackSource | null) {
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const { extractWaveform, isLoading: isAudioLoading } = useAudioPlayback(source);

  useEffect(() => {
    if (!source || isAudioLoading) {
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
  }, [source, isAudioLoading, extractWaveform]);

  return {
    waveform,
    isExtracting,
  };
}
