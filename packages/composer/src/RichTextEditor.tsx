"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Content, Extensions, JSONContent } from "@tiptap/core";
import type { ReactNode } from "react";

export type RichTextEditorProps = { label: string; content?: Content; onChange?: (value: { html: string; json: JSONContent }) => void; extensions?: Extensions; placeholder?: string; editable?: boolean; autofocus?: boolean; toolbar?: ReactNode; className?: string };

export default function RichTextEditor({ label, content = "", onChange, extensions = [], editable = true, autofocus = false, toolbar, className }: RichTextEditorProps) {
  const editor = useEditor({ extensions: [StarterKit, ...extensions], content, editable, autofocus, immediatelyRender: false, editorProps: { attributes: { "aria-label": label, role: "textbox" } }, onUpdate: ({ editor: instance }) => onChange?.({ html: instance.getHTML(), json: instance.getJSON() }) });
  if (!editor) return <div aria-busy="true" className={className} data-vc-component="rich-text-editor" data-vc-slot="root" data-vc-loading />;
  return <div className={className} data-vc-component="rich-text-editor" data-vc-slot="root"><div role="toolbar" aria-label={`${label} formatting`} data-vc-editor-toolbar>{toolbar ?? <>
    <button type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
    <button type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
    <button type="button" aria-label="Heading" aria-pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
    <button type="button" aria-label="Bulleted list" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>List</button>
    <button type="button" aria-label="Block quote" aria-pressed={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
    <button type="button" aria-label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Undo</button>
    <button type="button" aria-label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Redo</button>
  </>}</div><div data-vc-editor-content><EditorContent editor={editor} /></div></div>;
}
