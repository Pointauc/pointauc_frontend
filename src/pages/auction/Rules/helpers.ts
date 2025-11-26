import type { TFunction } from 'i18next';
import type { JSONContent } from '@tiptap/react';

export interface RulesPreset {
  name: string;
  id: string;
  content: JSONContent;
}

const getNextName = (index: number) => `Правила${index > 0 ? ` #${index + 1}` : ''}`;

export const buildDefaultRule = (t: TFunction, rules: RulesPreset[] = []): RulesPreset => {
  const names = rules.map((rule) => rule.name);

  let index = 0;
  let name = getNextName(index);
  while (names.includes(name)) {
    index += 1;
    name = getNextName(index);
  }

  return {
    name,
    id: Math.random().toString(),
    content: JSON.parse(t('auc.defaultRules')),
  };
};
