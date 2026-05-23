import { describe, expect, it } from 'vitest';

import { resolveVideoRequestMetadata } from '@domains/links/participant-url-parsing/resolveVideoRequestMetadata';

describe('resolveVideoRequestMetadata', () => {
  it('resolves video request metadata through the registered Twitch source', async () => {
    const metadata = await resolveVideoRequestMetadata({
      message: 'please play https://clips.twitch.tv/ClearSlug-123',
      parentHost: 'localhost',
    });

    expect(metadata).toMatchObject({
      source: 'twitch',
      provider: 'twitch-url-fallback',
      canonicalUrl: 'https://clips.twitch.tv/ClearSlug-123',
      title: 'Twitch clip',
      player: {
        parentHost: 'localhost',
      },
      sourceReference: {
        slug: 'ClearSlug-123',
      },
    });
    expect(metadata?.player.embedUrl).toContain('parent=localhost');
  });

  it('returns null for supported participant sources without video metadata', async () => {
    await expect(
      resolveVideoRequestMetadata({
        message: 'movie https://www.imdb.com/title/tt0111161/',
      }),
    ).resolves.toBeNull();
  });

  it('skips existing markdown links while looking for plain video URLs', async () => {
    const metadata = await resolveVideoRequestMetadata({
      message: '[clip](https://clips.twitch.tv/IgnoredSlug) https://www.twitch.tv/videos/123456789',
      parentHost: 'localhost',
    });

    expect(metadata).toMatchObject({
      source: 'twitch',
      canonicalUrl: 'https://www.twitch.tv/videos/123456789',
      sourceReference: {
        videoId: '123456789',
      },
    });
  });
});
