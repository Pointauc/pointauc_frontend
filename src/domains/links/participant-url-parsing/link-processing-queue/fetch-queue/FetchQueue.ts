import { AnyAction } from 'redux';
import PQueue from 'p-queue';

import { clearLotLinkParsingLoading, setLotLinkParsingLoading } from '../slice';
import { FAILED_LINK_CACHE_LIMIT, FAILED_LINK_CACHE_TTL_MS, FETCH_TIMEOUT_MS, MAX_ACTIVE_FETCHES } from '../config';
import { FetchTask, QueuedFetch } from '../types';

import { ExpiringSet } from './ExpiringSet';
import { runFetchTask } from './fetchTask';

export class FetchQueue {
  private readonly queue = new PQueue({ concurrency: MAX_ACTIVE_FETCHES });
  private readonly taskByLotId = new Map<string, FetchTask>();
  private readonly failedLinks = new ExpiringSet<string>(FAILED_LINK_CACHE_LIMIT, FAILED_LINK_CACHE_TTL_MS);

  constructor(private readonly dispatch: (action: AnyAction) => unknown) {}

  checkHasFailedLink(linkUrl: string): boolean {
    return this.failedLinks.has(linkUrl);
  }

  enqueue(lotId: string, { name, lotLinkParser }: QueuedFetch): void {
    if (!lotLinkParser.hasValidSourceLink || !lotLinkParser.detectedLinkUrl) {
      return;
    }

    this.abort(lotId);

    const controller = new AbortController();
    const task: FetchTask = {
      controller,
      timeoutId: null,
      isLoading: false,
    };
    this.taskByLotId.set(lotId, task);

    const taskPromise = this.queue.add(
      async ({ signal }) => {
        const taskSignal = signal ?? controller.signal;

        if (taskSignal.aborted) {
          return;
        }

        task.timeoutId = setTimeout(() => {
          controller.abort();
          this.failedLinks.add(lotLinkParser.detectedLinkUrl as string);
        }, FETCH_TIMEOUT_MS);
        task.isLoading = true;
        this.dispatch(setLotLinkParsingLoading({ lotId, sourceName: lotLinkParser.sourceName }));

        await runFetchTask({
          lotId,
          name,
          lotLinkParser,
          signal: taskSignal,
          dispatch: this.dispatch,
          failedLinks: this.failedLinks,
        });
      },
      { signal: controller.signal },
    );

    taskPromise
      .catch((err) => {
        if (!controller.signal.aborted && !this.checkIsAbortError(err) && lotLinkParser.detectedLinkUrl) {
          this.failedLinks.add(lotLinkParser.detectedLinkUrl);
        }
      })
      .finally(() => {
        if (this.taskByLotId.get(lotId) !== task) {
          return;
        }

        this.clearTask(lotId, task);
      });
  }

  abort(lotId: string): void {
    const task = this.taskByLotId.get(lotId);
    if (!task) {
      return;
    }

    task.controller.abort();
    this.clearTask(lotId, task);
  }

  clear(): void {
    this.taskByLotId.forEach((task, lotId) => {
      task.controller.abort();
      this.clearTask(lotId, task);
    });
    this.queue.clear();
    this.failedLinks.clear();
  }

  private clearTask(lotId: string, task: FetchTask): void {
    if (task.timeoutId) {
      clearTimeout(task.timeoutId);
    }

    this.taskByLotId.delete(lotId);
    if (task.isLoading) {
      this.dispatch(clearLotLinkParsingLoading(lotId));
    }
  }

  private checkIsAbortError(err: unknown): boolean {
    return err instanceof Error && err.name === 'AbortError';
  }
}
