import { EventHandler } from './types';

/**
 * Represents a single event in the queue with control capabilities
 */
export class QueuedEvent<T = any> {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly handler: EventHandler<T>;
  public isSkipped: boolean = false;
  public isRemoved: boolean = false;
  public result: T | undefined;
  public error: Error | undefined;
  public isCompleted: boolean = false;
  public isProcessing: boolean = false;

  constructor(handler: EventHandler<T>, id?: string) {
    this.id = id || this.generateId();
    this.handler = handler;
    this.createdAt = new Date();
  }

  /**
   * Marks this event as skipped
   * Skipped events will not be executed but will be removed from the queue
   */
  skip(): void {
    if (this.isProcessing) {
      throw new Error('Cannot skip an event that is currently being processed');
    }
    this.isSkipped = true;
  }

  /**
   * Marks this event as removed
   * Removed events will be completely removed from the queue
   */
  remove(): void {
    if (this.isProcessing) {
      throw new Error('Cannot remove an event that is currently being processed');
    }
    this.isRemoved = true;
  }

  /**
   * Executes the event handler
   * This method is intended to be called by the EventQueue only
   * @internal
   */
  async execute(): Promise<T> {
    if (this.isSkipped || this.isRemoved) {
      throw new Error('Cannot execute a skipped or removed event');
    }

    if (this.isCompleted) {
      throw new Error('Event has already been executed');
    }

    this.isProcessing = true;

    try {
      this.result = await this.handler();
      this.isCompleted = true;
      return this.result;
    } catch (error) {
      this.error = error as Error;
      this.isCompleted = true;
      throw this.error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Generates a unique identifier for the event
   */
  private generateId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Returns a string representation of the event for debugging
   */
  toString(): string {
    return `QueuedEvent(id=${this.id}, skipped=${this.isSkipped}, removed=${this.isRemoved}, completed=${this.isCompleted}, processing=${this.isProcessing})`;
  }
}
