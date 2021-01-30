class SlotNamesMap extends Map<string, string> {
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
}

const slotNamesMap = new SlotNamesMap();

export default slotNamesMap;
