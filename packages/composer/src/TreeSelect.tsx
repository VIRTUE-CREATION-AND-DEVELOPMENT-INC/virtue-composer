"use client";

import Popover from "./Popover";
import TreeView, { type TreeNode } from "./TreeView";
import useControllableState from "./useControllableState";

export type TreeSelectProps = { label: string; nodes: TreeNode[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; sideOffset?: number; collisionPadding?: number; placeholder?: string; name?: string; disabled?: boolean; required?: boolean; className?: string };

function find(nodes: TreeNode[], id?: string): TreeNode | undefined {
  for (const node of nodes) { if (node.id === id) return node; const child = find(node.children ?? [], id); if (child) return child; }
}

export default function TreeSelect({ label, nodes, value, defaultValue = "", onValueChange, open, defaultOpen = false, onOpenChange, side = "bottom", align = "start", sideOffset = 8, collisionPadding = 8, placeholder = "Select an item", name, disabled, required, className }: TreeSelectProps) {
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const selectedNode = find(nodes, selected);
  const select = (node: TreeNode) => { if (node.children?.length || node.disabled) return; setSelected(node.id); setOpen(false); };
  return <div className={className} data-vc-component="tree-select" data-vc-slot="root" data-vc-state={isOpen ? "open" : "closed"}><span data-vc-tree-select-label data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</span><Popover open={isOpen} onOpenChange={setOpen} trigger={<button type="button" role="combobox" aria-label={label} aria-expanded={isOpen} aria-required={required || undefined} disabled={disabled} data-vc-tree-select-trigger data-vc-slot="trigger">{selectedNode?.label ?? placeholder}</button>} align={align} side={side} sideOffset={sideOffset} collisionPadding={collisionPadding}><TreeView nodes={nodes} selectedIds={selected ? [selected] : []} onPrimaryAction={select} ariaLabel={`${label} options`} defaultExpandedIds={nodes.map((node) => node.id)} /></Popover>{name && <input type="hidden" name={name} value={selected} data-vc-slot="hidden-input" />}</div>;
}
