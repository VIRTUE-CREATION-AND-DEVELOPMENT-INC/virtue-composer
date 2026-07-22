"use client";

import { useState } from "react";
import Popover from "./Popover";
import TreeView, { type TreeNode } from "./TreeView";

export type TreeSelectProps = { label: string; nodes: TreeNode[]; value?: string; defaultValue?: string; onValueChange?: (id: string) => void; placeholder?: string; name?: string; disabled?: boolean; required?: boolean; className?: string };

function find(nodes: TreeNode[], id?: string): TreeNode | undefined {
  for (const node of nodes) { if (node.id === id) return node; const child = find(node.children ?? [], id); if (child) return child; }
}

export default function TreeSelect({ label, nodes, value, defaultValue, onValueChange, placeholder = "Select an item", name, disabled, required, className }: TreeSelectProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const selected = value ?? internal;
  const selectedNode = find(nodes, selected);
  const select = (node: TreeNode) => { if (node.children?.length || node.disabled) return; if (value === undefined) setInternal(node.id); onValueChange?.(node.id); setOpen(false); };
  return <div className={className} data-vc-component="tree-select" data-vc-slot="root"><span data-vc-tree-select-label>{label}{required && <span aria-hidden="true"> *</span>}</span><Popover open={open} onOpenChange={setOpen} trigger={<button type="button" role="combobox" aria-label={label} aria-expanded={open} aria-required={required || undefined} disabled={disabled} data-vc-tree-select-trigger>{selectedNode?.label ?? placeholder}</button>} align="start"><TreeView nodes={nodes} selectedIds={selected ? [selected] : []} onPrimaryAction={select} ariaLabel={`${label} options`} defaultExpandedIds={nodes.map((node) => node.id)} /></Popover>{name && <input type="hidden" name={name} value={selected} />}</div>;
}
