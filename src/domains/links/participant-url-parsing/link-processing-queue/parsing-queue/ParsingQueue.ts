import { AnyAction } from 'redux';
import PQueue from 'p-queue';

import { Lot } from '@models/slot.model';
import { RootState } from '@reducers';

import { clearLotLinkParsingLoading } from '../slice';
import { PARSE_BATCH_SIZE } from '../config';
import { FetchQueue } from '../fetch-queue/FetchQueue';
import { QueuedName } from '../types';
import { getSlotNameById } from '../utils';

import { parseNameTask, runParseBatchTask } from './parseTask';

export class ParsingQueue {
  private readonly queue = new PQueue({ concurrency: 1 });
  private readonly fetchQueue: FetchQueue;
  private readonly currentSlotNameById = new Map<string /* lotId */, string | null /* name */>();

  constructor(
    private readonly dispatch: (action: AnyAction) => unknown,
    private readonly getState: () => RootState,
  ) {
    this.fetchQueue = new FetchQueue(dispatch);
  }

  /**
   * Reconciles queue state after a bulk lot update.
   * Single-lot mutations should call queueLotName/removeLot directly to avoid
   * scanning large auctions on the hot path.
   */
  syncSlots(previousSlots: Lot[], nextSlots: Lot[]): void {
    if (!this.getState().aucSettings.settings.isLotLinkParsingEnabled) {
      this.clear();
      return;
    }

    const previousSlotNameById = getSlotNameById(previousSlots);
    const nextSlotNameById = getSlotNameById(nextSlots);
    this.currentSlotNameById.clear();
    nextSlotNameById.forEach((name, lotId) => {
      this.currentSlotNameById.set(lotId, name);
    });

    previousSlotNameById.forEach((_, lotId) => {
      if (!nextSlotNameById.has(lotId)) {
        this.removeLot(lotId);
      }
    });

    const changedLots: QueuedName[] = [];

    nextSlots.forEach(({ id, name }) => {
      const previousName = previousSlotNameById.get(id);
      if (previousSlotNameById.has(id) && previousName === name) {
        return;
      }

      changedLots.push({ id, name });
    });

    this.queueLotNames(changedLots);
  }

  queueLotName(lotId: string, name: string | null): void {
    if (!this.getState().aucSettings.settings.isLotLinkParsingEnabled) {
      this.removeLot(lotId);
      return;
    }

    this.currentSlotNameById.set(lotId, name);
    this.cancelLotWork(lotId);

    if (!name) {
      return;
    }

    if (this.checkHasQueuedWork()) {
      this.enqueueBatch([{ id: lotId, name }]);
      return;
    }

    this.parseLotName(lotId, name);
  }

  removeLot(lotId: string): void {
    this.currentSlotNameById.delete(lotId);
    this.cancelLotWork(lotId);
  }

  private queueLotNames(lots: QueuedName[]): void {
    if (lots.length === 0) {
      return;
    }

    const lotsWithNames = lots.filter(this.checkHasLotName);
    const shouldQueueWork = this.checkHasQueuedWork() || lotsWithNames.length > PARSE_BATCH_SIZE;

    lots.forEach(({ id, name }) => {
      this.currentSlotNameById.set(id, name);
      this.cancelLotWork(id);
    });

    if (shouldQueueWork) {
      this.enqueueBatches(lotsWithNames);
      return;
    }

    lotsWithNames.forEach(({ id, name }) => this.parseLotName(id, name));
  }

  private enqueueBatches(lots: QueuedName[]): void {
    for (let startIndex = 0; startIndex < lots.length; startIndex += PARSE_BATCH_SIZE) {
      this.enqueueBatch(lots.slice(startIndex, startIndex + PARSE_BATCH_SIZE));
    }
  }

  private enqueueBatch(lots: QueuedName[]): void {
    if (lots.length === 0) {
      return;
    }

    const task = this.queue.add(() => {
      runParseBatchTask({
        lots,
        parseLotName: (lotId, name) => this.parseLotName(lotId, name),
      });
    });

    task.catch((err) => {
      console.error('Queued lot name parsing failed:', err);
    });
  }

  private parseLotName(lotId: string, name: string): void {
    parseNameTask({
      lotId,
      name,
      fetchQueue: this.fetchQueue,
    });
  }

  private checkHasQueuedWork(): boolean {
    return this.queue.size > 0 || this.queue.pending > 0;
  }

  private checkHasLotName(lot: QueuedName): lot is QueuedName & { name: string } {
    return Boolean(lot.name);
  }

  private cancelLotWork(lotId: string): void {
    this.fetchQueue.abort(lotId);
    this.dispatch(clearLotLinkParsingLoading(lotId));
  }

  private clear(): void {
    this.fetchQueue.clear();
    this.queue.clear();
    this.currentSlotNameById.clear();
  }
}
