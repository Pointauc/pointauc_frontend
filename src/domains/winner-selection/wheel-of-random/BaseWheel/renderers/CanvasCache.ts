export class CanvasCache {
  private readonly backingCanvas: HTMLCanvasElement | null =
    typeof document !== 'undefined' ? document.createElement('canvas') : null;

  get canvas(): HTMLCanvasElement | null {
    return this.backingCanvas;
  }

  get context(): CanvasRenderingContext2D {
    return this.backingCanvas!.getContext('2d')!;
  }

  resize(size: number): void {
    if (!this.backingCanvas) {
      return;
    }

    this.backingCanvas.width = size;
    this.backingCanvas.height = size;
  }
}
