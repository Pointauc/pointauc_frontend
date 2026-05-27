import { trackAuctionLotNameWithUrl } from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import { LotLinkParser } from '@domains/links/participant-url-parsing/shared/LotLinkParser';

import { FetchQueue } from '../fetch-queue/FetchQueue';
import { QueuedName } from '../types';

interface ParseNameTaskParams {
  lotId: string;
  name: string;
  fetchQueue: FetchQueue;
}

interface RunParseBatchTaskParams {
  lots: QueuedName[];
  parseLotName: (lotId: string, name: string) => void;
}

export const parseNameTask = ({ lotId, name, fetchQueue }: ParseNameTaskParams): void => {
  const lotLinkParser = new LotLinkParser(name);
  if (!lotLinkParser.hasValidSourceLink || !lotLinkParser.detectedLinkUrl) {
    return;
  }

  trackAuctionLotNameWithUrl({ lotId });

  if (fetchQueue.checkHasFailedLink(lotLinkParser.detectedLinkUrl)) {
    return;
  }

  fetchQueue.enqueue(lotId, { name, lotLinkParser });
};

export const runParseBatchTask = ({ lots, parseLotName }: RunParseBatchTaskParams): void => {
  for (const { id, name } of lots) {
    if (name) {
      parseLotName(id, name);
    }
  }
};
