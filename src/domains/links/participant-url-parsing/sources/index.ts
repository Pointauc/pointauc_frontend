// Registered participant URL parsing sources.
import { imdbParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/imdb';
import { kinopoiskParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/kinopoisk';

import type { ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

export const participantUrlSources: ParticipantUrlSource[] = [imdbParticipantUrlSource, kinopoiskParticipantUrlSource];
