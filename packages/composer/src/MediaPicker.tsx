"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useState, type ReactNode } from "react";

export type MediaPickerItem = { id: string; src: string; alt: string; title: string; type?: "image" | "video" | "file"; thumbnail?: string; metadata?: ReactNode; disabled?: boolean };
export type MediaPickerProps = { label: string; items: MediaPickerItem[]; value?: string[]; defaultValue?: string[]; onValueChange?: (ids: string[]) => void; multiple?: boolean; searchPlaceholder?: string; empty?: ReactNode; loading?: boolean; error?: ReactNode; name?: string; className?: string };

export default function MediaPicker({ label, items, value, defaultValue = [], onValueChange, multiple = false, searchPlaceholder = "Search media", empty = "No media found", loading = false, error, name, className }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const update = (id: string) => {
    const next = multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id];
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    if (!multiple) setOpen(false);
  };
  const selectedLabel = selected.length === 0 ? label : `${selected.length} selected`;

  return <div className={className} data-vc-component="media-picker">
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild><button type="button" data-vc-media-picker-trigger>{selectedLabel}</button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay data-vc-media-picker-overlay />
        <Dialog.Content aria-describedby={undefined} data-vc-media-picker-content>
          <Dialog.Title>{label}</Dialog.Title>
          <Command data-vc-media-picker-command>
            <Command.Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} />
            <Command.List aria-busy={loading || undefined}>
              {loading && <div role="status">Loading media</div>}
              {error && <div role="alert">{error}</div>}
              {!loading && !error && <Command.Empty>{empty}</Command.Empty>}
              {!loading && !error && items.map((item) => <Command.Item key={item.id} value={`${item.title} ${item.alt}`} disabled={item.disabled} onSelect={() => update(item.id)} aria-selected={selected.includes(item.id)} data-vc-media-picker-item>
                {item.type === "image" || !item.type ? <img src={item.thumbnail ?? item.src} alt="" /> : <span aria-hidden="true">{item.type}</span>}
                <span><strong>{item.title}</strong>{item.metadata && <small>{item.metadata}</small>}</span>
              </Command.Item>)}
            </Command.List>
          </Command>
          {multiple && <Dialog.Close asChild><button type="button">Done</button></Dialog.Close>}
          <Dialog.Close asChild><button type="button" aria-label="Close media picker">Close</button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} />)}
  </div>;
}
