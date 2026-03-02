import { ArchivedLot } from '@models/slot.model';

/** Delimiter separating lot name from cost. Pipe (|) is unlikely to appear in lot names. */
export const CSV_DELIMITER = '|';

/**
 * Parses CSV text into ArchivedLot array.
 * Format: "Lot Name|Cost" or "Lot Name" (cost defaults to 1).
 * Each line represents one lot.
 */
export function parseCSV(text: string): ArchivedLot[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const lots: ArchivedLot[] = [];

  for (const line of lines) {
    const delimiterIndex = line.lastIndexOf(CSV_DELIMITER);

    if (delimiterIndex === -1) {
      lots.push({ name: line, amount: 1, investors: [] });
    } else {
      const name = line.substring(0, delimiterIndex).trim();
      const costStr = line.substring(delimiterIndex + 1).trim();
      const cost = parseInt(costStr, 10);

      if (!name) continue;

      lots.push({
        name,
        amount: !isNaN(cost) && cost > 0 ? cost : 1,
        investors: [],
      });
    }
  }

  return lots;
}

/** Serializes an ArchivedLot array to CSV text. */
export function lotsToCSV(lots: ArchivedLot[]): string {
  return lots
    .map((lot) => `${lot.name || ''}${CSV_DELIMITER}${lot.amount || 1}`)
    .join('\n');
}
