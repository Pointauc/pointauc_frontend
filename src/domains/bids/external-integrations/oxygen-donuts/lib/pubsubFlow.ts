import { Store } from '@tanstack/react-store';
import EventEmitter from 'eventemitter3';
import i18next from 'i18next';

import * as Integration from '@models/integration';

import { loadAccessToken } from './authStorage';
import { getApiOrigin } from './config';
import { mapDonationToBid } from './donation';
import { loadRate } from './rate';
import { buildStreamUrl, OxygenDonutsStream } from './stream';

import type { StreamStopReason } from './stream';

interface Params {
  /** The stream ended on its own: the access token was rejected or the connection could not be restored. */
  onStop: (reason: StreamStopReason) => void;
}

/**
 * Receives donations straight from the Oxygen Donuts API in the browser, without the Pointauc backend.
 */
export const buildOxygenDonutsFlow = ({ onStop }: Params): Integration.PubsubFlow => {
  const store = new Store<Integration.PubsubSubscription>({ subscribed: false, loading: false });
  const events = new EventEmitter<Integration.PubsubEvents>();

  const stream = new OxygenDonutsStream({
    buildUrl: (cursor) => buildStreamUrl(getApiOrigin(), loadAccessToken(), cursor),
    onStatusChange: (status) => store.setState({ subscribed: status === 'open', loading: status === 'connecting' }),
    onDonation: (donation) => {
      const bid = mapDonationToBid(donation, { rate: loadRate(), anonymousName: i18next.t('bid.anonymous') });
      if (bid) {
        events.emit('bid', bid);
      }
    },
    onStop,
  });

  const connect = async (): Promise<void> => {
    if (!loadAccessToken()) {
      onStop('unauthorized');
      throw new Error('Oxygen Donuts access token is missing');
    }

    await stream.start();
  };

  const disconnect = async (): Promise<void> => {
    stream.stop();
  };

  return { events, store, connect, disconnect };
};
