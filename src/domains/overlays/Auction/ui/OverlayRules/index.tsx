import { generateHTML, type JSONContent } from '@tiptap/react';
import { FC, useMemo } from 'react';

import { buildRichTextEditorExtensions } from '@shared/ui/RichTextEditor/hooks/useRichTextEditor';

import classes from './index.module.css';

interface OverlayRulesProps {
  rules: string; // JSON string containing the JSONContent
}

const OverlayRules: FC<OverlayRulesProps> = ({ rules }) => {
  const htmlContent = useMemo(() => {
    try {
      if (!rules) return '';

      // Parse the JSON string back to JSONContent
      const jsonContent: JSONContent = JSON.parse(rules);

      // Generate HTML from JSONContent using the same extensions as the editor
      const html = generateHTML(jsonContent, buildRichTextEditorExtensions());

      return html;
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
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default OverlayRules;
