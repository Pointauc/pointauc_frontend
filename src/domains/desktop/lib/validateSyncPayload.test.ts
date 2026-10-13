import { describe, expect, it } from 'vitest';

import {
  checkIsValidSyncPayload,
  getSyncPayloadSummary,
} from '@domains/desktop/lib/validateSyncPayload';
import { DesktopSyncDataPayload } from '@domains/desktop/model/types';

describe('validateSyncPayload', () => {
  it('validates sync payload structure', () => {
    expect(checkIsValidSyncPayload(null)).toBe(false);
    expect(checkIsValidSyncPayload(undefined)).toBe(false);
    expect(checkIsValidSyncPayload('string')).toBe(false);
    expect(checkIsValidSyncPayload({})).toBe(false);

    expect(
      checkIsValidSyncPayload({
        localStorage: { key: 'value' },
        sessionStorage: {},
        indexedDb: [],
      }),
    ).toBe(true);

    expect(
      checkIsValidSyncPayload({
        indexedDb: [
          {
            name: 'test-db',
            version: 1,
            stores: [],
          },
        ],
      }),
    ).toBe(true);
  });

  it('calculates sync payload summary statistics and extracts username', () => {
    const payload: DesktopSyncDataPayload = {
      localStorage: {
        theme: 'dark',
        pointauc_username: 'StreamerOne',
      },
      sessionStorage: {},
      indexedDb: [
        {
          name: 'pointauc-archive',
          version: 1,
          stores: [
            {
              name: 'archives',
              keyPath: 'id',
              autoIncrement: false,
              indexes: [],
              records: [
                { key: '1', value: { id: '1', name: 'Save 1' } },
                { key: '2', value: { id: '2', name: 'Save 2' } },
              ],
            },
          ],
        },
      ],
    };

    const summary = getSyncPayloadSummary(payload);
    expect(summary.archivesCount).toBe(2);
    expect(summary.settingsCount).toBe(2);
    expect(summary.detectedUsername).toBe('StreamerOne');
  });
});
