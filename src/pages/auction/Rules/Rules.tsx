import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ThunkDispatch } from 'redux-thunk';

import { RulesSettingsProvider } from '@pages/auction/Rules/RulesSettingsContext';
import RulesLayout from '@pages/auction/Rules/Layout';
import { checkIfMigrationEnabled, migrateRulesToIndexedDB } from '@domains/auction/rules/lib/migration';
import { rulesQueryKeys } from '@domains/auction/rules/model/constants';
import { rulesActiveApi } from '@domains/auction/rules';
import { saveSettings } from '@reducers/AucSettings/AucSettings';

import { buildDefaultRule } from './helpers';
import RulesSkeleton from './Skeleton';

const Rules = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const queryClient = useQueryClient();

  const [shouldMigrate] = useState(() => checkIfMigrationEnabled());

  const migrationQuery = useQuery({
    queryKey: ['migration'],
    queryFn: async () => {
      const firstRuleId = await migrateRulesToIndexedDB();
      if (firstRuleId) {
        dispatch(saveSettings({ activeRuleId: firstRuleId }));
      }
      return true;
    },
    enabled: shouldMigrate,
  });
  const isMigrationComplete = !migrationQuery.isLoading;

  // Fetch all rules
  const {
    data: rules = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: rulesQueryKeys.all,
    queryFn: () => rulesActiveApi.getAll(),
    enabled: isMigrationComplete,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (input: { name: string; data: string }) => rulesActiveApi.create(input),
    onSuccess: (newRule) => {
      queryClient.invalidateQueries({ queryKey: rulesQueryKeys.all });
      dispatch(saveSettings({ activeRuleId: newRule.id }));
    },
  });

  if (isMigrationComplete && !isFetching && rules.length === 0 && !createMutation.isPending) {
    const defaultRule = buildDefaultRule(t);
    createMutation.mutate({
      name: defaultRule.name,
      data: JSON.stringify(defaultRule.content),
    });
  }

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ name: string; data: string }> }) =>
      rulesActiveApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rulesQueryKeys.all });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => rulesActiveApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rulesQueryKeys.all });
    },
  });

  if (isLoading || !isMigrationComplete) {
    return <RulesSkeleton />;
  }

  return (
    <RulesSettingsProvider>
      <RulesLayout
        onRemoveRule={deleteMutation.mutate}
        onAddRule={createMutation.mutate}
        onUpdateRule={updateMutation.mutate}
        rules={rules}
      />
    </RulesSettingsProvider>
  );
};

export default Rules;
