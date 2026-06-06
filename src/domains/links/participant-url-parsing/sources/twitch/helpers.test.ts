import { describe, expect, it } from 'vitest';

import {
  extractTwitchClipReference,
  extractTwitchVideoReference,
  getSecondsFromTwitchTimestamp,
} from '@domains/links/participant-url-parsing/sources/twitch/helpers';

describe('Twitch URL helpers', () => {
  it('extracts clip slugs from clips.twitch.tv URLs', () => {
    expect(extractTwitchClipReference('https://clips.twitch.tv/ClearSlug-123')?.slug).toBe('ClearSlug-123');
  });

  it('extracts clip slugs from channel clip URLs', () => {
    expect(extractTwitchClipReference('https://www.twitch.tv/some_channel/clip/ClearSlug-123')).toEqual({
      kind: 'clip',
      slug: 'ClearSlug-123',
      channelName: 'some_channel',
    });
  });

  it('extracts VOD ids from twitch.tv video URLs', () => {
    expect(extractTwitchVideoReference('https://www.twitch.tv/videos/123456789')?.videoId).toBe('123456789');
  });

  it('extracts VOD ids from player URLs', () => {
    expect(extractTwitchVideoReference('https://player.twitch.tv/?video=v123456789')?.videoId).toBe('123456789');
  });

  it('parses VOD timestamps from Twitch time values', () => {
    expect(getSecondsFromTwitchTimestamp('1h2m3s')).toBe(3723);
    expect(extractTwitchVideoReference('https://www.twitch.tv/videos/123456789?t=1h2m3s')?.startsAtSeconds).toBe(3723);
  });
});
