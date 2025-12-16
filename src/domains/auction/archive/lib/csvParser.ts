import { ArchivedLot } from '@models/slot.model';

/**
 * CSV Delimiter used to separate lot name from cost
 * Using pipe (|) as it's unlikely to appear in lot names
 */
export const CSV_DELIMITER = '|';

/**
 * Parses CSV text into ArchivedLot array
 * Format: "Lot Name|Cost" or "Lot Name" (cost defaults to 1)
 * Each line represents one lot
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
      // No delimiter found, use entire line as name with cost 1
      lots.push({
        name: line,
        amount: 1,
        investors: [],
      });
    } else {
      // Delimiter found, split into name and cost
      const name = line.substring(0, delimiterIndex).trim();
      const costStr = line.substring(delimiterIndex + 1).trim();
      const cost = parseInt(costStr, 10);

      if (name && !isNaN(cost) && cost > 0) {
        lots.push({
          name,
          amount: cost,
          investors: [],
        });
      } else if (name) {
        // If cost is invalid, default to 1
        lots.push({
          name,
          amount: 1,
          investors: [],
        });
      }
      // If name is empty, skip this line
    }
  }

  return lots;
}

/**
 * Converts ArchivedLot array to CSV text
 */
export function lotsToCSV(lots: ArchivedLot[]): string {
  return lots
    .map((lot) => {
      const name = lot.name || '';
      const cost = lot.amount || 1;
      return `${name}${CSV_DELIMITER}${cost}`;
    })
    .join('\n');
}
