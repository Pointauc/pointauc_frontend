import { useClickOutside } from '@mantine/hooks';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import RichTextEditorTipTap from '@components/RichTextEditorTipTap/RichTextEditorTipTap.tsx';
import { useRulesBroadcasting } from '@domains/broadcasting/lib/useRulesBroadcasting';
import { buildDefaultRule, RulesPreset } from '@pages/auction/Rules/helpers';
import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import EditableSelect from '@shared/ui/EditableSelect/EditableSelect';
import { timedFunction } from '@utils/dataType/function.utils.ts';

import type { JSONContent } from '@tiptap/react';
import './Rules.scss';

const NEW_RULE_KEY = 'new-rule';
const saveRules = (rules: RulesPreset[]) => localStorage.setItem('rules', JSON.stringify(rules));

const RulesLayout = () => {
  const { t } = useTranslation();
  const { broadcastRules } = useRulesBroadcasting();

  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [rules, setRules] = React.useState<RulesPreset[]>(() => {
    const savedRules = localStorage.getItem('rules');
    return savedRules == null ? [buildDefaultRule(t)] : JSON.parse(savedRules);
  });
  const [selectedRuleId, setSelectedRuleId] = React.useState<string>(rules[0].id);
  const [initialRulesContent, setInitialRulesContent] = React.useState<JSONContent>(rules[0].content);
  const getRule = useCallback((id: string) => rules.find((rule) => rule.id === id), [rules]);
  const currentRule = useMemo(() => getRule(selectedRuleId), [getRule, selectedRuleId]);
  const [active, setActive] = React.useState(false);
  const {
    data: { size, background },
  } = useContext(RulesSettingsContext);

  const [dropdownRef, setDropdownRef] = React.useState<HTMLDivElement | null>(null);
  const [containerRef, setContainerRef] = React.useState<HTMLDivElement | null>(null);
  useClickOutside(
    () => {
      setActive(false);
    },
    null,
    [dropdownRef, containerRef],
  );

  useEffect(() => {
    const savedRules = localStorage.getItem('rules');

    if (savedRules !== null) {
      const parsedRules = JSON.parse(savedRules);
      setRules(parsedRules);
      setSelectedRuleId(parsedRules[0].id);
    }
  }, []);

  useEffect(() => {
    saveRules(rules);
  }, [rules]);

  useEffect(() => {
    setInitialRulesContent((prev) => rules.find((rule) => rule.id === selectedRuleId)?.content ?? prev);
    // to not update editor content on each change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRuleId]);

  const onRender = (element: HTMLDivElement) => {
    setContainer(element);
  };

  const updateRule = useCallback((id: string, data: Partial<RulesPreset>) => {
    setRules((rules) => rules.map<RulesPreset>((rule) => (rule.id === id ? { ...rule, ...data } : rule)));
  }, []);

  const setRuleContent = useMemo(
    () => timedFunction((content: JSONContent) => updateRule(selectedRuleId, { content }), 400),
    [selectedRuleId, updateRule],
  );

  const setRuleName = useCallback(
    (value: string) => updateRule(selectedRuleId, { name: value }),
    [selectedRuleId, updateRule],
  );

  const onRulesChanged = (content: JSONContent) => {
    setRuleContent(content);
  };

  useEffect(() => {
    if (currentRule) {
      broadcastRules(currentRule.content);
    }
  }, [currentRule, broadcastRules]);

  const createNewRule = () => {
    const newRule = buildDefaultRule(t, rules);
    setRules([...rules, newRule]);
    setSelectedRuleId(newRule.id);
  };

  const removeRule = (id: string) => {
    setRules((rules) => {
      const updatedRules = rules.filter((rule) => rule.id !== id);

      if (id === selectedRuleId) {
        if (updatedRules.length > 0) {
          setSelectedRuleId(updatedRules[0].id);
        } else {
          const newRule = buildDefaultRule(t);
          setSelectedRuleId(newRule.id);

          return [...updatedRules, newRule];
        }
      }

      return updatedRules;
    });
  };

  return (
    <div
      className={classNames('auc-rules', { active })}
      style={{ width: size }}
      ref={setContainerRef}
      onClick={() => setActive(true)}
    >
      <div className='title-container' ref={onRender}>
        <EditableSelect
          size='md'
          value={selectedRuleId}
          onChange={setSelectedRuleId}
          options={rules.map((rule) => ({ value: rule.id, label: rule.name }))}
          onOptionRename={(value, newLabel) => setRuleName(newLabel)}
          onOptionAdd={createNewRule}
          onOptionDelete={removeRule}
          dropdownRef={setDropdownRef}
        />
      </div>
      <div className='rules-description'>
        <RichTextEditorTipTap initialValue={initialRulesContent} onChange={onRulesChanged} />
      </div>
    </div>
  );
};

export default RulesLayout;
