import { ArchivedLot } from '@models/slot.model';

import { parseCSV } from './csvParser';
import { parseJSON } from './jsonParser';

/**
 * Detects whether the input string is JSON or CSV and parses accordingly.
 * Supported JSON formats:
 *  - ArchiveData object: `{ "lots": [...] }`
 *  - Plain array: `[{ "name": "...", "amount": N }, ...]` or `["name1", ...]`
 * Falls back to CSV parsing if not valid JSON.
 */
export function parseRawInput(text: string): ArchivedLot[] {
  return parseJSON(text) ?? parseCSV(text);
}
