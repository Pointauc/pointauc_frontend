/**
 * Event Queue Library
 *
 * A Sequential Event Queue that processes events one by one using Promise chains.
 * Perfect for scenarios where events must be executed in order and each event
 * must complete before the next one starts.
 *
 * @example
 * ```typescript
 * import { EventQueue } from '@lib/event-queue';
 *
 * const queue = new EventQueue({
 *   maxQueueSize: 50,
 *   continueOnError: true,
 *   eventTimeout: 10000
 * });
 *
 * // Add events to the queue
 * const wheelSpinEvent = queue.addEvent(async () => {
 *   console.log('Starting wheel spin...');
 *   await new Promise(resolve => setTimeout(resolve, 3000));
 *   console.log('Wheel spin completed!');
 *   return 'spin-result';
 * });
 *
 * const updateParticipantsEvent = queue.addEvent(async () => {
 *   console.log('Updating participants...');
 *   // Update logic here
 *   return 'participants-updated';
 * });
 *
 * // Control events
 * wheelSpinEvent.skip(); // Skip this event
 * updateParticipantsEvent.remove(); // Remove this event
 *
 * // Listen to queue events
 * queue.on('eventCompleted', (event, result) => {
 *   console.log(`Event ${event.getId()} completed with result:`, result);
 * });
 *
 * queue.on('stateChanged', (change) => {
 *   console.log(`Queue state changed from ${change.previousState} to ${change.currentState}`);
 * });
 *
 * // Get queue statistics
 * const stats = queue.getStats();
 * console.log(`Pending events: ${stats.pendingEvents}`);
 * ```
 */

export { EventQueue } from './event-queue';
export { QueuedEvent } from './queued-event';
export {
  QueueState,
  type EventHandler,
  type EventQueueOptions,
  type QueueStats,
  type QueueStateChangeEvent,
  type EventQueueEvents,
} from './types';
