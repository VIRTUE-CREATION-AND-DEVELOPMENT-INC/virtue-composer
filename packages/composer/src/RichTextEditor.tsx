"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { Content, Extensions, JSONContent } from "@tiptap/core";
import { useEffect, useRef, type ReactNode } from "react";

export type RichTextControl = "bold" | "italic" | "strike" | "heading" | "bullet-list" | "ordered-list" | "blockquote" | "link" | "undo" | "redo";
export type RichTextEditorProps = { label: string; content?: Content; onChange?: (value: { html: string; json: JSONContent }) => void; extensions?: Extensions; placeholder?: string; editable?: boolean; autofocus?: boolean; toolbar?: ReactNode; controls?: RichTextControl[]; toolbarOverflow?: "wrap" | "scroll"; onLinkRequest?: (currentHref?: string) => string | undefined | Promise<string | undefined>; className?: string };

const defaultControls: RichTextControl[] = ["bold", "italic", "heading", "bullet-list", "blockquote", "undo", "redo"];

export default function RichTextEditor({ label, content = "", onChange, extensions = [], editable = true, autofocus = false, toolbar, controls = defaultControls, toolbarOverflow = "wrap", onLinkRequest, className }: RichTextEditorProps) {
  const contentKey = typeof content === "string" ? content : JSON.stringify(content);
  const externalContent = useRef(contentKey);
  const editor = useEditor({ extensions: [StarterKit, ...extensions], content, editable, autofocus, immediatelyRender: false, editorProps: { attributes: { "aria-label": label, role: "textbox", "aria-readonly": String(!editable) } }, onUpdate: ({ editor: instance }) => onChange?.({ html: instance.getHTML(), json: instance.getJSON() }) });
  useEffect(() => { editor?.setEditable(editable); editor?.setOptions({ editorProps: { attributes: { "aria-label": label, role: "textbox", "aria-readonly": String(!editable) } } }); }, [editor, editable, label]);
  useEffect(() => {
    if (!editor || externalContent.current === contentKey) return;
    externalContent.current = contentKey;
    const matches = typeof content === "string" ? editor.getHTML() === content : JSON.stringify(editor.getJSON()) === contentKey;
    if (!matches) editor.commands.setContent(content, { emitUpdate: false });
  }, [content, contentKey, editor]);
  if (!editor) return <div aria-busy="true" className={className} data-vc-component="rich-text-editor" data-vc-slot="root" data-vc-loading />;
  const button = (control: RichTextControl) => {
    if (control === "bold") return <button key={control} type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>;
    if (control === "italic") return <button key={control} type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>;
    if (control === "strike") return <button key={control} type="button" aria-label="Strikethrough" aria-pressed={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>;
    if (control === "heading") return <button key={control} type="button" aria-label="Heading" aria-pressed={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>;
    if (control === "bullet-list") return <button key={control} type="button" aria-label="Bulleted list" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>List</button>;
    if (control === "ordered-list") return <button key={control} type="button" aria-label="Numbered list" aria-pressed={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>;
    if (control === "blockquote") return <button key={control} type="button" aria-label="Block quote" aria-pressed={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>;
    if (control === "link") return <button key={control} type="button" aria-label="Link" aria-pressed={editor.isActive("link")} onClick={async () => { const href = await onLinkRequest?.(editor.getAttributes("link").href as string | undefined); if (href === "") editor.chain().focus().extendMarkRange("link").unsetLink().run(); else if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run(); }}>Link</button>;
    if (control === "undo") return <button key={control} type="button" aria-label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>Undo</button>;
    return <button key={control} type="button" aria-label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>Redo</button>;
  };
  return <div className={className} data-vc-component="rich-text-editor" data-vc-slot="root" data-vc-state={editable ? "editable" : "readonly"}>{editable && <div role="toolbar" aria-label={`${label} formatting`} data-vc-editor-toolbar data-vc-slot="toolbar" data-vc-overflow={toolbarOverflow}>{toolbar ?? controls.map(button)}</div>}<div data-vc-editor-content data-vc-slot="content"><EditorContent editor={editor} /></div></div>;
}
