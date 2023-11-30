import { Slot } from '@models/slot.model.ts';

export class SlotNamesMap extends Map<string, string> {
  deleteBySlotId = (id: string): void => {
    this.forEach((value, key) => {
      if (id === value) {
        this.delete(key);
      }
    });
  };

  updateName = (previousName: string, name: string, id: string): void => {
    this.delete(previousName);
    this.set(name, id);
  };

  set = (key: string, value: string): this => super.set(key.toLowerCase(), value);
  get = (key: string): string | undefined => super.get(key.toLowerCase());

  setFromList(slots: Slot[]): void {
    slots.forEach(({ id, name, fastId }) => {
      if (name) {
        this.set(name, id);
      }

      this.set(`#${fastId}`, id);
    });
  }
}

const slotNamesMap = new SlotNamesMap();

export default slotNamesMap;
