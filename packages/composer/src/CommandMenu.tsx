"use client";

import { Command } from "cmdk";
import { useEffect, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type CommandItem = { id: string; label: string; description?: string; icon?: ReactNode; keywords?: string[]; disabled?: boolean; shortcut?: string };
export type CommandGroup = { id: string; heading?: string; items: CommandItem[] };
export type CommandMenuProps = { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; groups: CommandGroup[]; onSelect: (item: CommandItem) => void; label?: string; placeholder?: string; emptyText?: string; shortcutKey?: string | false; className?: string };

export default function CommandMenu({ open, defaultOpen = false, onOpenChange, groups, onSelect, label = "Command menu", placeholder = "Search commands", emptyText = "No commands found", shortcutKey = "k", className }: CommandMenuProps) {
  const [resolvedOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  useEffect(() => {
    if (!shortcutKey) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === shortcutKey.toLowerCase() && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!resolvedOpen);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [resolvedOpen, setOpen, shortcutKey]);

  return (
    <Command.Dialog open={resolvedOpen} onOpenChange={setOpen} label={label} className={className} data-vc-component="command-menu" data-vc-slot="root">
      <Command.Input placeholder={placeholder} aria-label={placeholder} data-vc-command-input />
      <Command.List data-vc-command-list>
        <Command.Empty>{emptyText}</Command.Empty>
        {groups.map((group) => (
          <Command.Group key={group.id} heading={group.heading} data-vc-command-group>
            {group.items.map((item) => <Command.Item key={item.id} value={item.label} keywords={item.keywords} disabled={item.disabled} onSelect={() => { onSelect(item); setOpen(false); }} data-vc-command-item>
              {item.icon && <span aria-hidden="true" data-vc-command-icon>{item.icon}</span>}
              <span><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
              {item.shortcut && <kbd>{item.shortcut}</kbd>}
            </Command.Item>)}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
