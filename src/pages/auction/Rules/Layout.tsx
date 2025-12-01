import { useClickOutside } from '@mantine/hooks';
import classNames from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useRulesBroadcasting } from '@domains/broadcasting/lib/useRulesBroadcasting';
import { buildDefaultRule, RulesPreset } from '@pages/auction/Rules/helpers';
import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import EditableSelect from '@shared/ui/EditableSelect/EditableSelect';
import { timedFunction } from '@utils/dataType/function.utils.ts';
import { RichTextEditorComponent } from '@shared/ui/RichTextEditor/RichTextEditor';
import { PortalContext } from '@App/storage/portalContext';

import classes from './Rules.module.css';
import RulesSettings from './Settings';

import type { JSONContent } from '@tiptap/react';

const saveRules = (rules: RulesPreset[]) => localStorage.setItem('rules', JSON.stringify(rules));

const RulesLayout = () => {
  const { t } = useTranslation();
  const { broadcastRules } = useRulesBroadcasting();

  const [rules, setRules] = React.useState<RulesPreset[]>(() => {
    const savedRules = localStorage.getItem('rules');
    return savedRules == null ? [buildDefaultRule(t)] : JSON.parse(savedRules);
  });
  const [selectedRuleId, setSelectedRuleId] = React.useState<string>(rules[0].id);
  const getRule = useCallback((id: string) => rules.find((rule) => rule.id === id), [rules]);
  const currentRule = useMemo(() => getRule(selectedRuleId), [getRule, selectedRuleId]);
  const [active, setActive] = React.useState(false);
  const {
    data: { size, background },
  } = useContext(RulesSettingsContext);
  const { portalRoot } = useContext(PortalContext);

  const [containerRef, setContainerRef] = React.useState<HTMLDivElement | null>(null);
  useClickOutside(
    () => {
      setActive(false);
    },
    null,
    [containerRef, portalRoot],
  );

  /**
   * Initial content of the active rule.
   * Used to set the content of the editor when the rule is changed or initially loaded.
   * We don't update this value on each change because tiptap has an issue with frequent updates.
   */
  const [initialContent, setInitialContent] = React.useState<JSONContent>(
    currentRule?.content ?? { type: 'doc', content: [] },
  );

  const setActiveRule = (id: string | RulesPreset) => {
    const rule = typeof id === 'string' ? getRule(id) : id;
    if (rule) {
      setSelectedRuleId(rule.id);
      setInitialContent(rule.content);
    }
  };

  useEffect(() => {
    saveRules(rules);
  }, [rules]);

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

  const createNewRule = (label?: string) => {
    const newRule = buildDefaultRule(t, rules, label);
    setRules([...rules, newRule]);
    setActiveRule(newRule);
  };

  const removeRule = (id: string) => {
    setRules((rules) => {
      const updatedRules = rules.filter((rule) => rule.id !== id);

      if (id === selectedRuleId) {
        if (updatedRules.length > 0) {
          setActiveRule(updatedRules[0].id);
        } else {
          const newRule = buildDefaultRule(t);
          setActiveRule(newRule);

          return [...updatedRules, newRule];
        }
      }

      return updatedRules;
    });
  };

  return (
    <div
      className={classNames(classes.rules, { [classes.active]: active })}
      style={{ width: size }}
      ref={setContainerRef}
      onClick={() => setActive(true)}
    >
      {active && (
        <div>
          <EditableSelect
            size='md'
            value={selectedRuleId}
            onChange={setActiveRule}
            options={rules.map((rule) => ({ value: rule.id, label: rule.name }))}
            onOptionRename={(value, newLabel) => setRuleName(newLabel)}
            onOptionAdd={createNewRule}
            onOptionDelete={removeRule}
          />
        </div>
      )}
      <div className={classes.editorWrapper} style={{ backgroundColor: background.color }}>
        <RichTextEditorComponent
          content={initialContent}
          onChange={onRulesChanged}
          isToolbarVisible={active}
          className={classes.editor}
          extraControls={<RulesSettings />}
        />
      </div>
    </div>
  );
};

export default RulesLayout;
