import { useClickOutside } from '@mantine/hooks';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { useDebouncer } from '@tanstack/react-pacer';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { PortalContext } from '@App/storage/portalContextData';
import { RuleRecord } from '@domains/auction/rules';
import { useRulesBroadcasting } from '@domains/broadcasting/lib/useRulesBroadcasting';
import { buildDefaultRule } from '@pages/auction/Rules/helpers';
import { RulesSettingsContext } from '@pages/auction/Rules/rulesSettingsContextData';
import { saveSettings } from '@reducers/AucSettings/AucSettings';
import { RootState } from '@reducers/index';
import EditableSelect from '@shared/ui/EditableSelect/EditableSelect';
import { RichTextEditorComponent } from '@shared/ui/RichTextEditor/RichTextEditor';

import classes from './Rules.module.css';
import RulesSettings from './Settings';

import type { JSONContent } from '@tiptap/react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface RulesLayoutProps {
  onRemoveRule: (id: string) => void;
  onAddRule: (rule: { name: string; data: string }) => void;
  onUpdateRule: (data: { id: string; updates: Partial<{ name: string; data: string }> }) => void;
  rules: RuleRecord[];
}

const MIN_RULES_SIZE = 200;
const MAX_RULES_SIZE = 550;

const clampRulesSize = (value: number) => Math.min(Math.max(value, MIN_RULES_SIZE), MAX_RULES_SIZE);

const RulesLayout = ({ onRemoveRule, onAddRule, onUpdateRule, rules }: RulesLayoutProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const activeRuleId = useSelector((state: RootState) => state.aucSettings.settings.activeRuleId ?? rules[0]?.id);

  const previousActiveRuleId = useRef<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: { size, background },
    merge,
  } = useContext(RulesSettingsContext);
  const { portalRoot } = useContext(PortalContext);

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ pointerX: 0, size: 0 });

  useClickOutside(
    () => {
      if (isResizing) return;
      setIsEditing(false);
    },
    null,
    [containerRef, portalRoot],
  );

  const getRule = useCallback((id: string) => rules.find((rule) => rule.id === id), [rules]);
  const currentRule = useMemo(() => (activeRuleId ? getRule(activeRuleId) : null), [activeRuleId, getRule]);
  const currentRuleContent = useMemo(() => (currentRule ? JSON.parse(currentRule.data) : null), [currentRule]);

  useRulesBroadcasting({ currentRuleContent });

  /**
   * Initial content of the active rule.
   * Used to set the content of the editor when the rule is changed or initially loaded.
   * We don't update this value on each change because tiptap has an issue with frequent updates.
   */
  const [initialContent, setInitialContent] = useState<JSONContent>({ type: 'doc', content: [] });

  if (currentRule && activeRuleId !== previousActiveRuleId.current) {
    try {
      setInitialContent(currentRuleContent);
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

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    resizeStartRef.current = {
      pointerX: event.clientX,
      size,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsEditing(true);
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - resizeStartRef.current.pointerX;
      merge({ size: clampRulesSize(resizeStartRef.current.size + deltaX) });
    };

    const stopResize = () => {
      setIsResizing(false);
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
    };
  }, [isResizing, merge]);

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
      className={classNames(classes.rules, 'relative', { [classes.active]: isEditing })}
      style={{ width: size }}
      ref={setContainerRef}
      onClick={() => setIsEditing(true)}
    >
      {isEditing && (
        <button
          type='button'
          className={classNames(
            'absolute -right-2 top-0 z-10 h-full w-4 cursor-ew-resize rounded-sm border-0 bg-transparent p-0',
            'before:absolute before:left-1/2 before:top-0 before:h-full before:w-0.5 before:-translate-x-1/2 before:rounded-full before:bg-yellow-400 before:shadow-[0_0_0_1px_rgba(0,0,0,0.35)]',
            'after:absolute after:left-1/2 after:top-1/2 after:h-12 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-x after:border-yellow-200 after:bg-yellow-500/80',
            'hover:before:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/70',
            { 'before:bg-yellow-300 after:bg-yellow-300': isResizing },
          )}
          aria-label={t('rules.resizeHandle')}
          onPointerDown={startResize}
        />
      )}
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
      <div className={`${classes.editorWrapper} rounded-md`} style={{ backgroundColor: background.color }}>
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
