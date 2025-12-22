import Dexie, { type EntityTable } from 'dexie';

import { CreateRuleInput, RuleRecord } from '../model/types';
import { RULES_DB_NAME } from '../model/constants';

import RulesApi from './RulesApi';

/**
 * Dexie database instance for rules management
 */
class RulesDatabase extends Dexie {
  rules!: EntityTable<RuleRecord, 'id'>;

  constructor() {
    super(RULES_DB_NAME);
    this.version(1).stores({
      rules: 'id, name, createdAt',
    });
  }
}

class IndexedDBAdapter extends RulesApi {
  private db: RulesDatabase;

  constructor() {
    super();
    this.db = new RulesDatabase();
  }

  /**
   * Retrieves all rule records
   */
  async getAll(): Promise<RuleRecord[]> {
    return await this.db.rules.toArray();
  }

  /**
   * Retrieves a single rule by ID
   */
  async getById(id: string): Promise<RuleRecord | null> {
    const result = await this.db.rules.get(id);
    return result || null;
  }

  /**
   * Creates a new rule record
   */
  async create(input: CreateRuleInput): Promise<RuleRecord> {
    const now = new Date().toISOString();
    const record: RuleRecord = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    await this.db.rules.add(record);
    return record;
  }

  /**
   * Updates an existing rule record
   */
  async update(id: string, updates: Partial<RuleRecord>): Promise<RuleRecord> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Rule not found');
    }

    const updated: RuleRecord = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await this.db.rules.put(updated);
    return updated;
  }

  /**
   * Deletes a rule record
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Rule not found');
    }

    await this.db.rules.delete(id);
  }
}

// Export singleton instance
const rulesActiveApi = new IndexedDBAdapter();
export default rulesActiveApi;
