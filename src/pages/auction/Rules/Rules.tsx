import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { IconButton, MenuItem, OutlinedInput, Select } from '@mui/material';
import { JSONContent } from '@tiptap/react';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import { timedFunction } from '@utils/dataType/function.utils.ts';
import RichTextEditorTipTap from '@components/RichTextEditorTipTap/RichTextEditorTipTap.tsx';
import { RulesSettingsContext, RulesSettingsProvider } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import './Rules.scss';

interface RulesPreset {
  name: string;
  id: string;
  content: JSONContent;
}

const getNextName = (index: number) => `Правила${index > 0 ? ` #${index + 1}` : ''}`;

const NEW_RULE_KEY = 'new-rule';
const saveRules = (rules: RulesPreset[]) => localStorage.setItem('rules', JSON.stringify(rules));

const RulesComponent = () => {
  const { t } = useTranslation();

  const buildDefaultRule = (rules: RulesPreset[] = []): RulesPreset => {
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

  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const [rules, setRules] = React.useState<RulesPreset[]>(() => {
    const savedRules = localStorage.getItem('rules');
    return savedRules == null ? [buildDefaultRule()] : JSON.parse(savedRules);
  });
  const [selectedRuleId, setSelectedRuleId] = React.useState<string>(rules[0].id);
  const [initialRulesContent, setInitialRulesContent] = React.useState<JSONContent>(rules[0].content);
  const getRule = useCallback((id: string) => rules.find((rule) => rule.id === id), [rules]);
  const currentRule = useMemo(() => getRule(selectedRuleId), [getRule, selectedRuleId]);
  const [active, setActive] = React.useState(false);
  const {
    data: { size, background },
  } = useContext(RulesSettingsContext);

  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const onRuleSelect = (id: string) => {
    if (id === NEW_RULE_KEY) {
      const newRule = buildDefaultRule(rules);
      setRules([...rules, newRule]);
      setSelectedRuleId(newRule.id);
    } else {
      setSelectedRuleId(id);
    }
  };

  const removeRule = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setRules((rules) => {
      const updatedRules = rules.filter((rule) => rule.id !== id);

      if (id === selectedRuleId) {
        if (updatedRules.length > 0) {
          setSelectedRuleId(updatedRules[0].id);
        } else {
          const newRule = buildDefaultRule();
          setSelectedRuleId(newRule.id);

          return [...updatedRules, newRule];
        }
      }

      return updatedRules;
    });
  };

  const handleMouseMove = useMemo(
    () =>
      timedFunction((e: MouseEvent) => {
        setActive((prevActive) => {
          if (!document.body.contains(e.target as Node)) return prevActive;
          const isInsideRules = containerRef.current?.contains(e.target as Node) ?? false;

          if (!isInsideRules && prevActive) {
            const modal = document.getElementsByClassName('MuiModal-root');

            return modal.length > 0;
          }

          return isInsideRules;
        });
      }, 200),
    [],
  );

  useEffect(() => {
    if (active) {
      document.addEventListener('mousedown', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseMove);
    };
  }, [active, handleMouseMove]);

  return (
    <div
      className={classNames('auc-rules', { active })}
      style={{ width: size }}
      ref={containerRef}
      onClick={() => setActive(true)}
    >
      <div className='title-container' ref={onRender}>
        <OutlinedInput
          value={currentRule?.name}
          onChange={(e) => setRuleName(e.target.value)}
          className='rules-title'
        />
        <Select
          value={selectedRuleId}
          className='rules-select'
          MenuProps={{
            className: 'rules-select-menu',
            anchorEl: container,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformOrigin: { vertical: 'top', horizontal: 'left' },
            PaperProps: { sx: { width: () => container?.clientWidth ?? 0 } },
          }}
          renderValue={() => null}
          onChange={(e) => onRuleSelect(e.target.value as string)}
        >
          {rules.map((rule) => (
            <MenuItem value={rule.id} key={rule.id}>
              {rule.name}
              <IconButton className='remove-rule-btn' onClick={(e) => removeRule(rule.id, e)}>
                <CloseIcon />
              </IconButton>
            </MenuItem>
          ))}
          <MenuItem value={NEW_RULE_KEY}>
            <IconButton>
              <AddIcon />
            </IconButton>
          </MenuItem>
        </Select>
      </div>
      <div className='rules-description'>
        <RichTextEditorTipTap initialValue={initialRulesContent} onChange={onRulesChanged} />
      </div>
    </div>
  );
};

const RulesContent = memo(RulesComponent);

const Rules = () => (
  <RulesSettingsProvider>
    <RulesContent />
  </RulesSettingsProvider>
);

export default Rules;
