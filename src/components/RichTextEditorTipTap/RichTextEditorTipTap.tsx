import { EditorOptions, EditorProvider, JSONContent, useCurrentEditor } from '@tiptap/react';
import React, { ReactNode, useContext, useEffect } from 'react';

import Toolbar from '@components/RichTextEditorTipTap/Toolbar/Toolbar.tsx';
import editorUtils from '@components/RichTextEditorTipTap/helpers.ts';
import { RulesSettingsContext } from '@pages/auction/Rules/RulesSettingsContext.tsx';
import './RichTextEditorTipTap.scss';

interface Props {
  onChange: (content: JSONContent) => void;
  initialValue: JSONContent;
}

const ValueChangeObserver = ({ initialValue }: Pick<Props, 'initialValue'>): ReactNode => {
  const { editor } = useCurrentEditor();
  useEffect(() => {
    editor?.commands.setContent(initialValue);
  }, [editor, initialValue]);

  return null;
};

const RichTextEditorTipTap = ({ onChange, initialValue }: Props) => {
  const {
    data: { background },
  } = useContext(RulesSettingsContext);
  const handleUpdate: EditorOptions['onUpdate'] = ({ editor }) => {
    onChange(editor.getJSON());
  };

  return (
    <div className='rich-editor-tiptap'>
      <div
        className='rich-editor-tiptap-background'
        style={{ backgroundColor: background.color, opacity: background.opacity }}
      />
      <EditorProvider onUpdate={handleUpdate} slotBefore={<Toolbar />} extensions={editorUtils.extensions}>
        <ValueChangeObserver initialValue={initialValue} />
      </EditorProvider>
    </div>
  );
};

export default RichTextEditorTipTap;
