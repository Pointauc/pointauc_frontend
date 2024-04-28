type eventCallback = (...args: any[]) => void;

export default class EventEmitter<TEvents extends string = string> {
  private listeners: Record<TEvents, eventCallback[]> = {} as any;

  emit(event: TEvents, ...args: any[]): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((listener) => {
      listener(...args);
    });
  }

  off(event: TEvents, callback: eventCallback): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter((listener) => listener !== callback);
  }

  on(event: TEvents, callback: eventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);

    return () => this.off(event, callback);
  }
}
