import React, { lazy } from 'react';
import { generateHTML } from '@tiptap/core';

// import editorUtils from '@components/RichTextEditorTipTap/helpers';

import classes from './index.module.css';

import type { JSONContent } from '@tiptap/react';

// const RichTextEditorTipTap = lazy(() => import('@components/RichTextEditorTipTap/RichTextEditorTipTap'));

interface OverlayRulesProps {
  rules: string; // JSON string containing the JSONContent
}

const OverlayRules: React.FC<OverlayRulesProps> = ({ rules }) => {
  const jsonContent = React.useMemo<JSONContent>(() => {
    try {
      if (!rules)
        return {
          type: 'doc',
          content: [],
        };

      return JSON.parse(rules);
    } catch (error) {
      console.error('Error parsing rules content:', error);
      return {
        type: 'doc',
        content: [],
      };
    }
  }, [rules]);

  const htmlContent = React.useMemo(() => {
    try {
      if (!rules) return '';

      // Parse the JSON string back to JSONContent
      const jsonContent: JSONContent = JSON.parse(rules);

      // Generate HTML from JSONContent using the same extensions as the editor
      // const html = generateHTML(jsonContent, editorUtils.extensions);

      return '';
    } catch (error) {
      console.error('Error parsing rules content:', error);
      return '';
    }
  }, [rules]);

  if (!htmlContent) {
    return null;
  }

  return (
    <div className={classes.overlayRulesContainer}>
      {/* <RichTextEditorTipTap initialValue={jsonContent} onChange={() => {}} showToolbar={false} /> */}
    </div>
  );
};

export default OverlayRules;
