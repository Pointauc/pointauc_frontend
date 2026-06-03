import { AnyAction } from 'redux';

import { trackAuctionAutoParsedLotNameWithUrl } from '@domains/auction/analytics/model/auctionFeatureUsageStore';
import { showLotParsingNotification } from '@domains/links/participant-url-parsing/lib/showLotParsingNotification';
import { setSlotName } from '@reducers/Slots/Slots';

import { QueuedFetch } from '../types';

import { ExpiringSet } from './ExpiringSet';

interface RunFetchTaskParams extends QueuedFetch {
  lotId: string;
  signal: AbortSignal;
  dispatch: (action: AnyAction) => unknown;
  failedLinks: ExpiringSet<string>;
}

export const runFetchTask = async ({
  lotId,
  name,
  lotLinkParser,
  signal,
  dispatch,
  failedLinks,
}: RunFetchTaskParams): Promise<void> => {
  const parsingResult = await lotLinkParser.replaceLinkWithMarkdown(signal);

  if (!parsingResult || signal.aborted) {
    if (!signal.aborted && lotLinkParser.detectedLinkUrl) {
      failedLinks.add(lotLinkParser.detectedLinkUrl);
    }
    return;
  }

  if (parsingResult.lotName === name) {
    return;
  }

  trackAuctionAutoParsedLotNameWithUrl({ lotId });
  showLotParsingNotification(parsingResult, lotLinkParser, name);
  dispatch(setSlotName({ id: lotId, name: parsingResult.lotName, ignoreParsing: true }));
};
