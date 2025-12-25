/**
 * Default suggested YouTube tracks for wheel soundtrack
 * Epic/dramatic music suitable for wheel spins
 */
export const DEFAULT_SUGGESTED_TRACKS: Wheel.SoundtrackSourceYoutube[] = [
  {
    type: 'youtube',
    videoId: 'Iof5pRAIZmw',
    title: 'Epic Dramatic Music - "Rise of Legends"',
    channelTitle: 'Powerful Music',
    duration: 180,
    thumbnailUrl: 'https://i.ytimg.com/vi/Iof5pRAIZmw/hqdefault.jpg',
  },
  {
    type: 'youtube',
    videoId: '4Tr0otuiQuU',
    title: 'Epic Cinematic Music - "Legendary"',
    channelTitle: 'Epic Music World',
    duration: 172,
    thumbnailUrl: 'https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg',
  },
  {
    type: 'youtube',
    videoId: 'xU8-jmGEwis',
    title: 'Game Show Music - Wheel of Fortune Theme',
    channelTitle: 'Classic TV Themes',
    duration: 120,
    thumbnailUrl: 'https://i.ytimg.com/vi/xU8-jmGEwis/hqdefault.jpg',
  },
];

/** Maximum file size for audio uploads (50MB) */
export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024;

/** Supported audio MIME types */
export const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];

/** Number of waveform samples to extract for visualization */
export const WAVEFORM_SAMPLES = 110;

/** Default soundtrack config */
export const DEFAULT_SOUNDTRACK_CONFIG: Wheel.SoundtrackConfig = {
  enabled: false,
  source: null,
  offset: 0,
  volume: 0.5,
};
