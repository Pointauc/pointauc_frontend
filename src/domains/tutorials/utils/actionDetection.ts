import { RefObject } from 'react';

type ActionCallback = () => void;

/**
 * Action listener manager for tutorial step progression
 */
export class ActionDetectionManager {
  private listeners: Map<string, { element: HTMLElement; handler: EventListener }> = new Map();

  /**
   * Attach click listener to an element for action detection
   */
  attachClickListener(actionId: string, elementRef: RefObject<HTMLElement>, callback: ActionCallback): void {
    if (!elementRef.current) {
      console.warn(`Cannot attach listener for action "${actionId}": element not found`);
      return;
    }

    // Remove existing listener if any
    this.removeListener(actionId);

    const handler = (event: Event) => {
      event.stopPropagation();
      callback();
    };

    elementRef.current.addEventListener('click', handler, { capture: true });
    this.listeners.set(actionId, { element: elementRef.current, handler });
  }

  /**
   * Attach input listener to an element for action detection
   */
  attachInputListener(actionId: string, elementRef: RefObject<HTMLElement>, callback: ActionCallback): void {
    if (!elementRef.current) {
      console.warn(`Cannot attach listener for action "${actionId}": element not found`);
      return;
    }

    // Remove existing listener if any
    this.removeListener(actionId);

    const handler = () => {
      callback();
    };

    elementRef.current.addEventListener('input', handler);
    this.listeners.set(actionId, { element: elementRef.current, handler });
  }

  /**
   * Attach custom event listener
   */
  attachCustomListener(
    actionId: string,
    elementRef: RefObject<HTMLElement>,
    eventType: string,
    callback: ActionCallback
  ): void {
    if (!elementRef.current) {
      console.warn(`Cannot attach listener for action "${actionId}": element not found`);
      return;
    }

    // Remove existing listener if any
    this.removeListener(actionId);

    const handler = () => {
      callback();
    };

    elementRef.current.addEventListener(eventType, handler);
    this.listeners.set(actionId, { element: elementRef.current, handler });
  }

  /**
   * Remove a specific listener
   */
  removeListener(actionId: string): void {
    const listener = this.listeners.get(actionId);
    if (listener) {
      listener.element.removeEventListener('click', listener.handler, { capture: true });
      listener.element.removeEventListener('input', listener.handler);
      this.listeners.delete(actionId);
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach((listener, actionId) => {
      this.removeListener(actionId);
    });
    this.listeners.clear();
  }

  /**
   * Check if a listener is attached
   */
  hasListener(actionId: string): boolean {
    return this.listeners.has(actionId);
  }
}

// Singleton instance for global action detection management
export const actionDetectionManager = new ActionDetectionManager();

