import type { JSONContent } from '@tiptap/react';

export interface RuleRecord {
  id: string;
  name: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export type RuleData = JSONContent;

export type CreateRuleInput = Omit<RuleRecord, 'id' | 'createdAt' | 'updatedAt'>;

