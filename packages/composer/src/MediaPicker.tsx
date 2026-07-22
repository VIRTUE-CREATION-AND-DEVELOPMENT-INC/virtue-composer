"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useState, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type MediaPickerItem = { id: string; src: string; alt: string; title: string; type?: "image" | "video" | "file"; thumbnail?: string; metadata?: ReactNode; disabled?: boolean };
export type MediaPickerProps = { label: string; items: MediaPickerItem[]; value?: string[]; defaultValue?: string[]; onValueChange?: (ids: string[]) => void; multiple?: boolean; searchPlaceholder?: string; empty?: ReactNode; loading?: boolean; error?: ReactNode; name?: string; className?: string };

export default function MediaPicker({ label, items, value, defaultValue = [], onValueChange, multiple = false, searchPlaceholder = "Search media", empty = "No media found", loading = false, error, name, className }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const update = (id: string) => {
    const next = multiple ? (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]) : [id];
    setSelected(next);
    if (!multiple) setOpen(false);
  };
  const selectedLabel = selected.length === 0 ? label : `${selected.length} selected`;

  return <div className={className} data-vc-component="media-picker" data-vc-slot="root" data-vc-state={loading ? "loading" : error ? "error" : open ? "open" : "closed"} data-vc-selected={selected.length > 0 || undefined}>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild><button type="button" data-vc-media-picker-trigger data-vc-slot="trigger">{selectedLabel}</button></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay data-vc-media-picker-overlay data-vc-slot="overlay" />
        <Dialog.Content aria-describedby={undefined} data-vc-media-picker-content data-vc-slot="content">
          <Dialog.Title data-vc-slot="title">{label}</Dialog.Title>
          <Command data-vc-media-picker-command data-vc-slot="command">
            <Command.Input aria-label={searchPlaceholder} placeholder={searchPlaceholder} data-vc-slot="input" />
            <Command.List aria-busy={loading || undefined} data-vc-slot="list">
              {loading && <div role="status" data-vc-slot="loading">Loading media</div>}
              {error && <div role="alert" data-vc-slot="error">{error}</div>}
              {!loading && !error && <Command.Empty data-vc-slot="empty">{empty}</Command.Empty>}
              {!loading && !error && items.map((item) => <Command.Item key={item.id} value={`${item.title} ${item.alt}`} disabled={item.disabled} onSelect={() => update(item.id)} aria-selected={selected.includes(item.id)} data-vc-media-picker-item data-vc-slot="option" data-vc-type={item.type ?? "image"}>
                {item.type === "image" || !item.type ? <img src={item.thumbnail ?? item.src} alt="" data-vc-slot="thumbnail" /> : <span aria-hidden="true" data-vc-slot="type">{item.type}</span>}
                <span data-vc-slot="copy"><strong>{item.title}</strong>{item.metadata && <small>{item.metadata}</small>}</span>
              </Command.Item>)}
            </Command.List>
          </Command>
          {multiple && <Dialog.Close asChild><button type="button" data-vc-slot="done">Done</button></Dialog.Close>}
          <Dialog.Close asChild><button type="button" aria-label="Close media picker" data-vc-slot="close">Close</button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    {name && selected.map((id) => <input key={id} type="hidden" name={name} value={id} data-vc-slot="hidden-input" />)}
  </div>;
}
