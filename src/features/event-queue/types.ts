import { QueuedEvent } from './queued-event';
/**
 * Represents the state of the event queue
 */
export enum QueueState {
  IDLE = 'idle',
  PROCESSING = 'processing',
  PAUSED = 'paused',
}

/**
 * Type for event handler functions that return a Promise
 */
export type EventHandler<T = any> = () => Promise<T> | T;

/**
 * Configuration options for the event queue
 */
export interface EventQueueOptions {
  /**
   * Maximum number of events that can be queued
   * @default 100
   */
  maxQueueSize?: number;

  /**
   * Whether to continue processing after an error occurs
   * @default true
   */
  continueOnError?: boolean;

  /**
   * Timeout in milliseconds for each event execution
   * @default 30000
   */
  eventTimeout?: number;
}

/**
 * Event queue statistics
 */
export interface QueueStats {
  pendingEvents: number;
  currentState: QueueState;
  isProcessing: boolean;
}

/**
 * Interface for event queue state changes
 */
export interface QueueStateChangeEvent {
  previousState: QueueState;
  currentState: QueueState;
  queueSize: number;
}

/**
 * Event types for typed EventEmitter
 */
export interface EventQueueEvents {
  eventAdded: (event: QueuedEvent) => void;
  eventStarted: (event: QueuedEvent) => void;
  eventCompleted: (event: QueuedEvent, result: any) => void;
  eventFailed: (event: QueuedEvent, error: Error) => void;
  eventsRemoved: (count: number) => void;
  queueCleared: (count: number) => void;
  queuePaused: () => void;
  queueResumed: () => void;
  queueStopped: (error: Error) => void;
  stateChanged: (change: QueueStateChangeEvent) => void;
}
