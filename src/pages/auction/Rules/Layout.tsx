import { useClickOutside } from '@mantine/hooks';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { useDebouncer } from '@tanstack/react-pacer';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { PortalContext } from '@App/storage/portalContext';
import { RuleRecord } from '@domains/auction/rules';
import { useRulesBroadcasting } from '@domains/broadcasting/lib/useRulesBroadcasting';
import { buildDefaultRule } from '@pages/auction/Rules/helpers';
import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import { saveSettings } from '@reducers/AucSettings/AucSettings';
import { RootState } from '@reducers/index';
import EditableSelect from '@shared/ui/EditableSelect/EditableSelect';
import { RichTextEditorComponent } from '@shared/ui/RichTextEditor/RichTextEditor';

import classes from './Rules.module.css';
import RulesSettings from './Settings';

import type { JSONContent } from '@tiptap/react';

interface RulesLayoutProps {
  onRemoveRule: (id: string) => void;
  onAddRule: (rule: { name: string; data: string }) => void;
  onUpdateRule: (data: { id: string; updates: Partial<{ name: string; data: string }> }) => void;
  rules: RuleRecord[];
}

const RulesLayout = ({ onRemoveRule, onAddRule, onUpdateRule, rules }: RulesLayoutProps) => {
  const { t } = useTranslation();
  const { broadcastRules } = useRulesBroadcasting();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const activeRuleId = useSelector((state: RootState) => state.aucSettings.settings.activeRuleId ?? rules[0]?.id);

  const previousActiveRuleId = useRef<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: { size, background },
  } = useContext(RulesSettingsContext);
  const { portalRoot } = useContext(PortalContext);

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  useClickOutside(
    () => {
      setIsEditing(false);
    },
    null,
    [containerRef, portalRoot],
  );

  const getRule = useCallback((id: string) => rules.find((rule) => rule.id === id), [rules]);
  const currentRule = useMemo(() => (activeRuleId ? getRule(activeRuleId) : null), [activeRuleId, getRule]);

  /**
   * Initial content of the active rule.
   * Used to set the content of the editor when the rule is changed or initially loaded.
   * We don't update this value on each change because tiptap has an issue with frequent updates.
   */
  const [initialContent, setInitialContent] = useState<JSONContent>({ type: 'doc', content: [] });

  if (currentRule && activeRuleId !== previousActiveRuleId.current) {
    try {
      const content = JSON.parse(currentRule.data);
      setInitialContent(content);
      previousActiveRuleId.current = activeRuleId;
    } catch (error) {
      console.error('Failed to parse rule content:', error);
      setInitialContent({ type: 'doc', content: [] });
    }
  }

  const setActiveRule = (id: string) => {
    dispatch(saveSettings({ activeRuleId: id }));
  };

  const { maybeExecute: updateRuleContent } = useDebouncer(
    (content: JSONContent) => {
      if (activeRuleId) {
        onUpdateRule({
          id: activeRuleId,
          updates: { data: JSON.stringify(content) },
        });
      }
    },
    { wait: 750 },
  );

  const setRuleName = (value: string) => {
    if (activeRuleId) {
      onUpdateRule({
        id: activeRuleId,
        updates: { name: value },
      });
    }
  };

  const onRulesChanged = (content: JSONContent) => {
    updateRuleContent(content);
  };

  useEffect(() => {
    if (currentRule) {
      try {
        const content = JSON.parse(currentRule.data);
        broadcastRules(content);
      } catch (error) {
        console.error('Failed to parse rule content for broadcasting:', error);
      }
    }
  }, [currentRule, broadcastRules]);

  const createNewRule = (label?: string) => {
    const newRule = buildDefaultRule(t, rules, label);
    onAddRule({
      name: newRule.name,
      data: JSON.stringify(newRule.content),
    });
  };

  const removeRule = (id: string) => {
    onRemoveRule(id);

    if (id === activeRuleId) {
      const remainingRules = rules.filter((rule) => rule.id !== id);
      if (remainingRules.length > 0) {
        dispatch(saveSettings({ activeRuleId: remainingRules[0].id }));
      } else {
        // A new rule will be created by the useEffect above
        dispatch(saveSettings({ activeRuleId: null }));
      }
    }
  };

  return (
    <div
      className={classNames(classes.rules, { [classes.active]: isEditing })}
      style={{ width: size }}
      ref={setContainerRef}
      onClick={() => setIsEditing(true)}
    >
      {isEditing && activeRuleId && (
        <div>
          <EditableSelect
            size='md'
            value={activeRuleId}
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
          isToolbarVisible={isEditing}
          className={classes.editor}
          extraControls={<RulesSettings />}
        />
      </div>
    </div>
  );
};

export default RulesLayout;
