import EventEmitter from 'eventemitter3';

import { QueuedEvent } from './queued-event';
import {
  EventHandler,
  QueueState,
  EventQueueOptions,
  QueueStats,
  QueueStateChangeEvent,
  EventQueueEvents,
} from './types';

/**
 * Sequential Event Queue that processes events one by one using Promise chains
 * Events are processed in FIFO order and each event must complete before the next one starts
 */
export class EventQueue extends EventEmitter<EventQueueEvents> {
  private readonly options: Required<EventQueueOptions>;
  private readonly events: QueuedEvent[] = [];
  private state: QueueState = QueueState.IDLE;
  private currentEvent: QueuedEvent | null = null;
  private processingPromise: Promise<void> | null = null;

  constructor(options: EventQueueOptions = {}) {
    super();
    this.options = {
      maxQueueSize: options.maxQueueSize ?? 100,
      continueOnError: options.continueOnError ?? true,
      eventTimeout: options.eventTimeout ?? 30000,
    };
  }

  get first(): QueuedEvent | null {
    return this.events[0] ?? null;
  }

  /**
   * Adds an event to the queue and returns a QueuedEvent instance for control
   * @param handler The event handler function that returns a Promise
   * @param eventId Optional custom event ID
   * @returns QueuedEvent instance that can be used to skip, remove, or check status
   */
  addEvent<T = any>(handler: EventHandler<T>, eventId?: string): QueuedEvent<T> {
    if (this.events.length >= this.options.maxQueueSize) {
      throw new Error(`Queue is full. Maximum size is ${this.options.maxQueueSize}`);
    }

    const queuedEvent = new QueuedEvent(handler, eventId);
    this.events.push(queuedEvent);

    this.emit('eventAdded', queuedEvent);

    // Start processing if queue was idle
    if (this.state === QueueState.IDLE) {
      this.startProcessing();
    }

    return queuedEvent;
  }

  /**
   * Removes completed, skipped, and removed events from the head of the queue
   */
  cleanupHead(): void {
    while (this.first && (this.first.isCompleted || this.first.isSkipped || this.first.isRemoved)) {
      this.removeFirstEvent();
    }
  }

  /**
   * Removes completed, skipped, and removed events from the queue
   */
  cleanup(): void {
    const beforeCount = this.events.length;

    // Remove events that are completed, skipped, or marked for removal
    const indicesToRemove = [];
    for (let i = this.events.length - 1; i >= 0; i--) {
      const event = this.events[i];
      if (event.isCompleted || event.isSkipped || event.isRemoved) {
        indicesToRemove.push(i);
      }
    }

    indicesToRemove.forEach((index) => {
      this.events.splice(index, 1);
    });

    const removedCount = beforeCount - this.events.length;
    if (removedCount > 0) {
      this.emit('eventsRemoved', removedCount);
    }
  }

  /**
   * Clears all pending events from the queue
   * Does not affect the currently processing event
   */
  clear(): void {
    const pendingEvents = this.events.filter((event) => !event.isProcessing && !event.isCompleted);

    pendingEvents.forEach((event) => event.remove());
    this.cleanup();

    this.emit('queueCleared', pendingEvents.length);
  }

  /**
   * Pauses the queue processing
   * The current event will finish, but no new events will start
   */
  pause(): void {
    if (this.state === QueueState.PROCESSING) {
      this.changeState(QueueState.PAUSED);
      this.emit('queuePaused');
    }
  }

  /**
   * Resumes the queue processing if it was paused
   */
  resume(): void {
    if (this.state === QueueState.PAUSED) {
      this.changeState(QueueState.PROCESSING);
      this.emit('queueResumed');
      this.continueProcessing();
    }
  }

  /**
   * Gets the current state of the queue
   */
  getState(): QueueState {
    return this.state;
  }

  /**
   * Gets comprehensive statistics about the queue
   */
  getStats(): QueueStats {
    const pendingEvents = this.events.filter(
      (event) => !event.isCompleted && !event.isSkipped && !event.isRemoved,
    ).length;

    return {
      pendingEvents,
      currentState: this.state,
      isProcessing: this.currentEvent !== null,
    };
  }

  /**
   * Gets the currently processing event (if any)
   */
  getCurrentEvent(): QueuedEvent | null {
    return this.currentEvent;
  }

  /**
   * Gets all events in the queue (including completed ones until cleanup)
   */
  getAllEvents(): readonly QueuedEvent[] {
    return [...this.events];
  }

  /**
   * Gets only pending events (not completed, skipped, or removed)
   */
  getPendingEvents(): readonly QueuedEvent[] {
    return this.events.filter((event) => !event.isCompleted && !event.isSkipped && !event.isRemoved);
  }

  /**
   * Waits for all currently queued events to complete
   * @param timeout Optional timeout in milliseconds
   */
  async waitForCompletion(timeout?: number): Promise<void> {
    const startTime = Date.now();

    while (this.getPendingEvents().length > 0 || this.currentEvent !== null) {
      if (timeout && Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for queue completion');
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  /**
   * Starts processing events in the queue
   */
  private startProcessing(): void {
    if (this.processingPromise) {
      return; // Already processing
    }

    this.changeState(QueueState.PROCESSING);
    this.processingPromise = this.processEvents();
  }

  /**
   * Continues processing if in processing state
   */
  private continueProcessing(): void {
    if (this.state === QueueState.PROCESSING && !this.processingPromise) {
      this.processingPromise = this.processEvents();
    }
  }

  /**
   * Main processing loop that handles events sequentially
   */
  private async processEvents(): Promise<void> {
    try {
      while (this.state === QueueState.PROCESSING) {
        const nextEvent = this.getNextEvent();

        if (!nextEvent) {
          // No more events to process
          break;
        }

        this.currentEvent = nextEvent;
        this.emit('eventStarted', nextEvent);

        try {
          // Execute the event with timeout
          const result = await this.executeWithTimeout(nextEvent);
          this.emit('eventCompleted', nextEvent, result);
        } catch (error) {
          this.emit('eventFailed', nextEvent, error as Error);

          if (!this.options.continueOnError) {
            this.emit('queueStopped', error as Error);
            break;
          }
        } finally {
          this.currentEvent = null;
          // Auto-remove completed or failed events
          this.cleanupHead();
        }
      }
    } finally {
      this.processingPromise = null;

      if (this.state === QueueState.PROCESSING) {
        this.changeState(QueueState.IDLE);
      }
    }
  }

  /**
   * Gets the next event to process (skips removed and skipped events)
   */
  private getNextEvent(): QueuedEvent | null {
    for (const event of this.events) {
      if (event.isRemoved || event.isSkipped || event.isCompleted) {
        continue;
      }

      return event;
    }

    return null;
  }

  /**
   * Executes an event with timeout protection
   */
  private async executeWithTimeout<T>(event: QueuedEvent<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Event execution timed out after ${this.options.eventTimeout}ms`));
      }, this.options.eventTimeout);

      event
        .execute()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Removes a specific event from the queue
   */
  private removeFirstEvent(): void {
    if (this.events.length > 0) {
      this.events.shift();
    }
  }

  /**
   * Changes the queue state and emits change event
   */
  private changeState(newState: QueueState): void {
    const previousState = this.state;
    this.state = newState;

    const changeEvent: QueueStateChangeEvent = {
      previousState,
      currentState: newState,
      queueSize: this.events.length,
    };

    this.emit('stateChanged', changeEvent);
  }
}
