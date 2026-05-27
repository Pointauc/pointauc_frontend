import { LotLinkParser } from '@domains/links/participant-url-parsing/shared/LotLinkParser';

export interface QueuedName {
  id: string;
  name: string | null;
}

export interface QueuedFetch {
  name: string;
  lotLinkParser: LotLinkParser;
}

export interface FetchTask {
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isLoading: boolean;
}
