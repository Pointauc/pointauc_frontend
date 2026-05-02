// Registered participant URL parsing sources.
import { imdbParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/imdb';
import { kinopoiskParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/kinopoisk';
import { youtubeParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/youtube';

import type { ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

export const participantUrlSources: ParticipantUrlSource[] = [
  imdbParticipantUrlSource,
  kinopoiskParticipantUrlSource,
  youtubeParticipantUrlSource,
];
