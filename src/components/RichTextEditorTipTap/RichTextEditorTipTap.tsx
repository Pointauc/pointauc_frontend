import { EditorOptions, EditorProvider, JSONContent, useCurrentEditor } from '@tiptap/react';
import React, { ReactNode, useEffect } from 'react';

import Toolbar from '@components/RichTextEditorTipTap/Toolbar/Toolbar.tsx';
import editorUtils from '@components/RichTextEditorTipTap/helpers.ts';
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
  const handleUpdate: EditorOptions['onUpdate'] = ({ editor }) => {
    onChange(editor.getJSON());
  };

  return (
    <div className='rich-editor-tiptap'>
      <EditorProvider onUpdate={handleUpdate} slotBefore={<Toolbar />} extensions={editorUtils.extensions}>
        <ValueChangeObserver initialValue={initialValue} />
      </EditorProvider>
    </div>
  );
};

export default RichTextEditorTipTap;
