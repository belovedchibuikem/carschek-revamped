'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function EmailHtmlEditor({ value, onChange, placeholder }: Props) {
  // Avoid SSR / hydration mismatch (TipTap ProseMirror DOM ≠ server HTML).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder: placeholder || 'Design your email…' }),
      ],
      content: value || '<p></p>',
      immediatelyRender: false,
      onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none min-h-[220px] px-3 py-2 focus:outline-none text-[#1F2937]',
        },
      },
    },
    [mounted]
  );

  useEffect(() => {
    if (!editor || !mounted) return;
    const current = editor.getHTML();
    if (value && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor, mounted]);

  if (!mounted || !editor) {
    return (
      <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white min-h-[280px]">
        <div className="flex flex-wrap gap-1 p-2 border-b border-[#E5E7EB] bg-[#F9FAFB] h-10" />
        <div className="px-3 py-2 text-sm text-[#9CA3AF]">Loading editor…</div>
      </div>
    );
  }

  const btn = (active: boolean) =>
    `px-2 py-1 text-xs rounded border ${active ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'bg-white text-[#374151] border-[#E5E7EB]'}`;

  return (
    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#E5E7EB] bg-[#F9FAFB]">
        <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button
          type="button"
          className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          Clear
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
