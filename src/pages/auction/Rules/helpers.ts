import type { TFunction } from 'i18next';
import type { JSONContent } from '@tiptap/react';

export interface RulesPreset {
  name: string;
  id: string;
  content: JSONContent;
}

const getNextName = (prefix: string, index: number) => `${prefix}${index > 0 ? ` #${index + 1}` : ''}`;

const getAvailableName = (prefix: string, names: string[]) => {
  let index = 0;
  let name = getNextName(prefix, index);
  while (names.includes(name)) {
    index += 1;
    name = getNextName(prefix, index);
  }
  return name;
};

export const buildDefaultRule = (t: TFunction, rules: RulesPreset[] = [], newName?: string): RulesPreset => {
  const name = getAvailableName(
    newName || t('auc.defaultRuleName'),
    rules.map((rule) => rule.name),
  );

  return {
    name,
    id: Math.random().toString(),
    content: JSON.parse(t('auc.defaultRules')),
  };
};
