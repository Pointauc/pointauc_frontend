import { parseMarkdownLotLink } from '@domains/links/lib/lotNameLink';
import { Slot } from '@models/slot.model.ts';

const normalizeLookupKey = (key: string): string => key.trim().toLowerCase();

const addUniqueValue = (values: string[], value: string | null | undefined): void => {
  if (value && !values.includes(value)) {
    values.push(value);
  }
};

export const getSlotNameLookupValues = (name: string | null | undefined): string[] => {
  const values: string[] = [];
  addUniqueValue(values, name ?? undefined);

  const markdownLink = parseMarkdownLotLink(name);
  if (!name || !markdownLink) {
    return values;
  }

  const prefix = name.slice(0, markdownLink.startIndex);
  const suffix = name.slice(markdownLink.endIndex);

  addUniqueValue(values, `${prefix}${markdownLink.label}${suffix}`);
  addUniqueValue(values, `${prefix}${markdownLink.rawUrl}${suffix}`);

  return values;
};

export class SlotNamesMap {
  /** Stores every normalized alias and the slot id it resolves to. */
  private aliases = new Map<string, string>();

  /** Stores all normalized alias keys registered for each slot id. */
  private aliasKeysBySlotId = new Map<string, Set<string>>();

  /**
   * Adds or replaces a normalized alias for a slot and keeps the reverse lookup in sync.
   */
  private setAlias = (aliasKey: string, lotId: string): void => {
    const normalizedKey = normalizeLookupKey(aliasKey);
    if (!normalizedKey) {
      return;
    }

    const previousLotId = this.aliases.get(normalizedKey);
    if (previousLotId) {
      const previousAliasKeys = this.aliasKeysBySlotId.get(previousLotId);
      previousAliasKeys?.delete(normalizedKey);

      if (previousAliasKeys?.size === 0) {
        this.aliasKeysBySlotId.delete(previousLotId);
      }
    }

    this.aliases.set(normalizedKey, lotId);

    const aliasKeys = this.aliasKeysBySlotId.get(lotId) ?? new Set<string>();
    aliasKeys.add(normalizedKey);
    this.aliasKeysBySlotId.set(lotId, aliasKeys);
  };

  /**
   * Removes every alias associated with a lot id.
   */
  private deleteAliasesByLotId = (lotId: string): void => {
    const aliasKeys = this.aliasKeysBySlotId.get(lotId);
    if (!aliasKeys) {
      return;
    }

    aliasKeys.forEach((aliasKey) => {
      if (this.aliases.get(aliasKey) === lotId) {
        this.aliases.delete(aliasKey);
      }
    });

    this.aliasKeysBySlotId.delete(lotId);
  };

  /**
   * Rebuilds the generated aliases derived from the slot name and fast id.
   */
  private setSlotAliases = ({ id, name, fastId }: Slot): void => {
    this.deleteAliasesByLotId(id);
    getSlotNameLookupValues(name).forEach((value) => this.setAlias(value, id));
    this.setAlias(`#${fastId}`, id);
  };

  /** Removes every alias associated with a lot id. */
  deleteBySlotId = (lotId: string): void => {
    this.deleteAliasesByLotId(lotId);
  };

  /** Registers a custom alias for a lot id. */
  set = (aliasKey: string, lotId: string): this => {
    this.setAlias(aliasKey, lotId);
    return this;
  };

  /** Resolves any supported alias format to a slot id. */
  get = (aliasKey: string): string | undefined => {
    const normalizedKey = normalizeLookupKey(aliasKey);
    return this.aliases.get(normalizedKey);
  };

  /** Deletes a single alias key and updates the reverse lookup entry for its slot. */
  delete = (aliasKey: string): boolean => {
    const normalizedKey = normalizeLookupKey(aliasKey);
    const lotId = this.aliases.get(normalizedKey);
    if (!lotId) {
      return false;
    }

    this.aliases.delete(normalizedKey);

    const aliasKeys = this.aliasKeysBySlotId.get(lotId);
    aliasKeys?.delete(normalizedKey);

    if (aliasKeys?.size === 0) {
      this.aliasKeysBySlotId.delete(lotId);
    }

    return true;
  };

  /** Clears all stored aliases and reverse lookup data. */
  clear = (): void => {
    this.aliases.clear();
    this.aliasKeysBySlotId.clear();
  };

  /** Replaces every alias for a slot with aliases generated from its current data. */
  updateSlot = (slot: Slot): void => {
    this.setSlotAliases(slot);
  };

  /** Clears all aliases and rebuilds the generated aliases for the provided slot list. */
  setFromList(slots: Slot[]): void {
    this.clear();
    slots.forEach(this.setSlotAliases);
  }
}

const slotNamesMap = new SlotNamesMap();

export default slotNamesMap;
