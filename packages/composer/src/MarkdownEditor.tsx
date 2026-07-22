"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SegmentedControl from "./SegmentedControl";

export type MarkdownEditorMode = "write" | "preview" | "split";
export type MarkdownEditorProps = { label: string; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; mode?: MarkdownEditorMode; defaultMode?: MarkdownEditorMode; onModeChange?: (mode: MarkdownEditorMode) => void; placeholder?: string; name?: string; disabled?: boolean; rows?: number; className?: string };

export default function MarkdownEditor({ label, value, defaultValue = "", onValueChange, mode, defaultMode = "write", onModeChange, placeholder, name, disabled, rows = 12, className }: MarkdownEditorProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalMode, setInternalMode] = useState<MarkdownEditorMode>(defaultMode);
  const currentValue = value ?? internalValue;
  const currentMode = mode ?? internalMode;
  const changeMode = (next: string) => { if (!next) return; const resolved = next as MarkdownEditorMode; if (mode === undefined) setInternalMode(resolved); onModeChange?.(resolved); };
  const changeValue = (next: string) => { if (value === undefined) setInternalValue(next); onValueChange?.(next); };
  return <div className={className} data-vc-component="markdown-editor" data-vc-slot="root" data-vc-mode={currentMode}><div data-vc-markdown-header><span>{label}</span><SegmentedControl ariaLabel={`${label} view`} value={currentMode} onValueChange={changeMode} items={[{ value: "write", label: "Write" }, { value: "preview", label: "Preview" }, { value: "split", label: "Split" }]} /></div><div data-vc-markdown-panes>{currentMode !== "preview" && <textarea aria-label={`${label} markdown`} name={name} value={currentValue} placeholder={placeholder} disabled={disabled} rows={rows} onChange={(event) => changeValue(event.currentTarget.value)} data-vc-markdown-input />}{currentMode !== "write" && <div aria-label={`${label} preview`} data-vc-markdown-preview><ReactMarkdown remarkPlugins={[remarkGfm]}>{currentValue}</ReactMarkdown></div>}</div></div>;
}
