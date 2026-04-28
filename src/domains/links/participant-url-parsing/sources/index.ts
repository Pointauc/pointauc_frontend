// Registered participant URL parsing sources.
import { imdbParticipantUrlSource } from '@domains/links/participant-url-parsing/sources/imdb';

import type { ParticipantUrlSource } from '@domains/links/participant-url-parsing/types';

export const participantUrlSources: ParticipantUrlSource[] = [imdbParticipantUrlSource];
