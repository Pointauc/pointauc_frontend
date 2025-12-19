export const RULES_DB_NAME = 'pointauc-rules';
export const RULES_STORE_NAME = 'rules';

export const rulesQueryKeys = {
  all: ['rules'] as const,
  rule: (id: string | null) => ['rules', id] as const,
  activeRule: ['rules', 'active'] as const,
};
