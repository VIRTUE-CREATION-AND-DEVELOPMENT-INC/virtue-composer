"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type MentionInputItem = { id: string; label: string; value?: string; description?: ReactNode; disabled?: boolean };
export type MentionInputProps = {
  label: string;
  items: MentionInputItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onMentionsChange?: (ids: string[]) => void;
  trigger?: string;
  placeholder?: string;
  emptyText?: ReactNode;
  rows?: number;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function MentionInput({ label, items, value, defaultValue = "", onValueChange, onMentionsChange, trigger = "@", placeholder, emptyText = "No mentions found", rows = 4, name, required, disabled, className }: MentionInputProps) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [cursor, setCursor] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const escapedTrigger = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.slice(0, cursor).match(new RegExp(`(?:^|\\s)${escapedTrigger}([^\\s${escapedTrigger}]*)$`));
  const query = match?.[1] ?? "";
  const start = match ? cursor - query.length - trigger.length : -1;
  const suggestions = useMemo(() => match ? items.filter((item) => !item.disabled && `${item.label} ${item.value ?? ""}`.toLowerCase().includes(query.toLowerCase())) : [], [items, match, query]);
  const open = Boolean(match) && !dismissed;
  useEffect(() => { if (activeIndex >= suggestions.length) setActiveIndex(0); }, [activeIndex, suggestions.length]);
  const mentionIds = (next: string) => items.filter((item) => next.includes(`${trigger}${item.value ?? item.label}`)).map((item) => item.id);
  const update = (next: string, nextCursor: number) => { setText(next); setCursor(nextCursor); setDismissed(false); onMentionsChange?.(mentionIds(next)); };
  const choose = (item: MentionInputItem) => {
    if (start < 0) return;
    const insertion = `${trigger}${item.value ?? item.label} `;
    const next = `${text.slice(0, start)}${insertion}${text.slice(cursor)}`;
    const nextCursor = start + insertion.length;
    update(next, nextCursor);
    setActiveIndex(0);
    requestAnimationFrame(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(nextCursor, nextCursor); });
  };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (!open || suggestions.length === 0) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => (index + 1) % suggestions.length); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length); }
    if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); choose(suggestions[activeIndex] ?? suggestions[0]); }
    if (event.key === "Escape") { event.preventDefault(); setDismissed(true); }
  };
  return <div className={className} data-vc-component="mention-input" data-vc-slot="root" data-vc-state={disabled ? "disabled" : open ? "suggesting" : text ? "populated" : "empty"}>
    <label htmlFor={id} data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</label>
    <textarea ref={inputRef} id={id} name={name} value={text} onChange={(event) => update(event.currentTarget.value, event.currentTarget.selectionStart)} onClick={(event) => { setCursor(event.currentTarget.selectionStart); setDismissed(false); }} onKeyUp={(event) => { if (event.key !== "Escape") setCursor(event.currentTarget.selectionStart); }} onKeyDown={keyDown} rows={rows} placeholder={placeholder} required={required} disabled={disabled} role="combobox" aria-haspopup="listbox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? listId : undefined} aria-activedescendant={open && suggestions[activeIndex] ? `${id}-${suggestions[activeIndex].id}` : undefined} data-vc-slot="input" />
    {open && <div id={listId} role="listbox" aria-label={`${label} suggestions`} data-vc-slot="suggestions">{suggestions.length === 0 ? <div data-vc-slot="empty">{emptyText}</div> : suggestions.map((item, index) => <button key={item.id} id={`${id}-${item.id}`} type="button" role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} data-vc-slot="suggestion"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</button>)}</div>}
  </div>;
}
