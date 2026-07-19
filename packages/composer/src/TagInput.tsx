"use client";

import { useId, useState, type KeyboardEvent } from "react";

export type TagInputProps = { label: string; value?: string[]; defaultValue?: string[]; onValueChange?: (tags: string[]) => void; placeholder?: string; name?: string; disabled?: boolean; maxTags?: number; allowDuplicates?: boolean; description?: string; className?: string };

export default function TagInput({ label, value, defaultValue = [], onValueChange, placeholder = "Add a tag", name, disabled, maxTags, allowDuplicates = false, description, className }: TagInputProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [draft, setDraft] = useState("");
  const tags = value ?? internal;
  const commit = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const add = () => {
    const tag = draft.trim();
    if (!tag || (!allowDuplicates && tags.includes(tag)) || (maxTags !== undefined && tags.length >= maxTags)) return;
    commit([...tags, tag]); setDraft("");
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); }
    if (event.key === "Backspace" && !draft && tags.length > 0) commit(tags.slice(0, -1));
  };
  return <div className={className} data-vc-component="tag-input"><label htmlFor={id}>{label}</label>{description && <p id={`${id}-description`}>{description}</p>}<div data-vc-tag-control>{tags.map((tag, index) => <span key={`${tag}-${index}`} data-vc-tag><span>{tag}</span><button type="button" aria-label={`Remove ${tag}`} disabled={disabled} onClick={() => commit(tags.filter((_, candidate) => candidate !== index))}>×</button>{name && <input type="hidden" name={name} value={tag} />}</span>)}<input id={id} value={draft} disabled={disabled || (maxTags !== undefined && tags.length >= maxTags)} placeholder={placeholder} aria-describedby={description ? `${id}-description` : undefined} onChange={(event) => setDraft(event.currentTarget.value)} onBlur={add} onKeyDown={keyDown} /></div></div>;
}
