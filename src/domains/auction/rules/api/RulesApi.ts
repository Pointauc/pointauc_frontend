import { CreateRuleInput, RuleRecord } from '../model/types';

/**
 * Abstract base class for rules operations.
 * Implementations can use IndexedDB, backend API, or any other storage mechanism.
 */
abstract class RulesApi {
  abstract getAll(): Promise<RuleRecord[]>;
  abstract getById(id: string): Promise<RuleRecord | null>;
  abstract create(input: CreateRuleInput): Promise<RuleRecord>;
  abstract update(id: string, updates: Partial<RuleRecord>): Promise<RuleRecord>;
  abstract delete(id: string): Promise<void>;
}

export default RulesApi;

