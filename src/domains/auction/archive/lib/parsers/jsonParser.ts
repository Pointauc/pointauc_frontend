import { ArchivedLot } from '@models/slot.model';

/**
 * Parses a JSON string into an ArchivedLot array.
 * Supports ArchiveData format `{ "lots": [...] }`, plain object arrays, and string arrays.
 * Returns null if the string is not valid JSON or does not resolve to a recognizable lot list.
 */
export function parseJSON(text: string): ArchivedLot[] | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);

    let items: unknown[];

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      if (!Array.isArray(obj.lots)) return null;
      items = obj.lots;
    } else if (Array.isArray(parsed)) {
      items = parsed;
    } else {
      return null;
    }

    return items.map((item) =>
      typeof item === 'string'
        ? ({ name: item, amount: 1, investors: [] } as ArchivedLot)
        : (item as ArchivedLot),
    );
  } catch {
    return null;
  }
}
