import { Slot } from '@models/slot.model.ts';

export class FastIdAllocator {
  private maxFastId = 0;

  private availableFastIds: number[] = [];

  private usedFastIds = new Set<number>();

  private swap = (leftIndex: number, rightIndex: number): void => {
    [this.availableFastIds[leftIndex], this.availableFastIds[rightIndex]] = [
      this.availableFastIds[rightIndex],
      this.availableFastIds[leftIndex],
    ];
  };

  private pushAvailableFastId = (fastId: number): void => {
    this.availableFastIds.push(fastId);

    let index = this.availableFastIds.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.availableFastIds[parentIndex] <= this.availableFastIds[index]) {
        break;
      }

      this.swap(parentIndex, index);
      index = parentIndex;
    }
  };

  private popAvailableFastId = (): number | undefined => {
    const result = this.availableFastIds[0];
    const lastValue = this.availableFastIds.pop();

    if (lastValue == null || this.availableFastIds.length === 0) {
      return result;
    }

    this.availableFastIds[0] = lastValue;
    let index = 0;
    let hasHeapChanged = true;

    while (hasHeapChanged) {
      const leftIndex = index * 2 + 1;
      const rightIndex = leftIndex + 1;
      let smallestIndex = index;

      if (
        leftIndex < this.availableFastIds.length &&
        this.availableFastIds[leftIndex] < this.availableFastIds[smallestIndex]
      ) {
        smallestIndex = leftIndex;
      }

      if (
        rightIndex < this.availableFastIds.length &&
        this.availableFastIds[rightIndex] < this.availableFastIds[smallestIndex]
      ) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === index) {
        hasHeapChanged = false;
      } else {
        this.swap(index, smallestIndex);
        index = smallestIndex;
      }
    }

    return result;
  };

  private reserveFastId = (fastId: number): number => {
    this.usedFastIds.add(fastId);
    this.maxFastId = Math.max(this.maxFastId, fastId);
    return fastId;
  };

  allocate = (preferredFastId?: number): number => {
    if (preferredFastId != null && preferredFastId > 0 && !this.usedFastIds.has(preferredFastId)) {
      return this.reserveFastId(preferredFastId);
    }

    while (this.availableFastIds.length > 0) {
      const fastId = this.popAvailableFastId();
      if (fastId != null && !this.usedFastIds.has(fastId)) {
        return this.reserveFastId(fastId);
      }
    }

    return this.reserveFastId(this.maxFastId + 1);
  };

  release = (fastId: number): void => {
    if (fastId <= 0 || !this.usedFastIds.delete(fastId)) {
      return;
    }

    this.pushAvailableFastId(fastId);
  };

  reset = (): void => {
    this.maxFastId = 0;
    this.availableFastIds = [];
    this.usedFastIds.clear();
  };

  setFromList = (slots: Slot[]): void => {
    this.reset();

    slots.forEach(({ fastId }) => {
      if (fastId > 0) {
        this.usedFastIds.add(fastId);
        this.maxFastId = Math.max(this.maxFastId, fastId);
      }
    });

    for (let fastId = 1; fastId < this.maxFastId; fastId += 1) {
      if (!this.usedFastIds.has(fastId)) {
        this.pushAvailableFastId(fastId);
      }
    }
  };
}

const fastIdAllocator = new FastIdAllocator();

export default fastIdAllocator;
