"use client";

import { hotkeysCoreFeature, selectionFeature, syncDataLoaderFeature, type Updater } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { useMemo, useState, type ReactNode } from "react";

export type TreeNode = { id: string; label: string; children?: TreeNode[]; icon?: ReactNode; disabled?: boolean; metadata?: ReactNode };
export type TreeViewProps = { nodes: TreeNode[]; selectedIds?: string[]; defaultSelectedIds?: string[]; onSelectedIdsChange?: (ids: string[]) => void; onPrimaryAction?: (node: TreeNode) => void; defaultExpandedIds?: string[]; multiSelect?: boolean; ariaLabel?: string; indent?: number; className?: string };

function flatten(nodes: TreeNode[], map = new Map<string, TreeNode>()) {
  for (const node of nodes) { map.set(node.id, node); flatten(node.children ?? [], map); }
  return map;
}

export default function TreeView({ nodes, selectedIds, defaultSelectedIds = [], onSelectedIdsChange, onPrimaryAction, defaultExpandedIds = [], multiSelect = false, ariaLabel = "Tree", indent = 20, className }: TreeViewProps) {
  const data = useMemo(() => flatten(nodes), [nodes]);
  const [internalSelected, setInternalSelected] = useState(defaultSelectedIds);
  const selection = selectedIds ?? internalSelected;
  const setSelectedItems = (updater: Updater<string[]>) => {
    const next = typeof updater === "function" ? updater(selection) : updater;
    if (selectedIds === undefined) setInternalSelected(next);
    onSelectedIdsChange?.(next);
  };
  const tree = useTree<TreeNode>({
    rootItemId: "__vc-root__",
    getItemName: (item) => item.getItemData().label,
    isItemFolder: (item) => item.getId() === "__vc-root__" || Boolean(item.getItemData().children?.length),
    dataLoader: {
      getItem: (id) => id === "__vc-root__" ? { id, label: ariaLabel, children: nodes } : data.get(id)!,
      getChildren: (id) => (id === "__vc-root__" ? nodes : data.get(id)?.children ?? []).map((node) => node.id),
    },
    indent,
    initialState: { expandedItems: defaultExpandedIds, selectedItems: defaultSelectedIds },
    state: { selectedItems: selection },
    setSelectedItems,
    onPrimaryAction: (item) => { if (item.getId() !== "__vc-root__") onPrimaryAction?.(item.getItemData()); },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  return <div {...tree.getContainerProps(ariaLabel)} className={className} aria-multiselectable={multiSelect || undefined} data-vc-component="tree-view">{tree.getItems().map((item) => {
    const node = item.getItemData();
    const props = item.getProps();
    return <button {...props} key={item.getId()} type="button" disabled={node.disabled} style={{ paddingInlineStart: `${item.getItemMeta().level * indent}px` }} data-vc-tree-item data-vc-folder={item.isFolder() || undefined} data-vc-expanded={item.isExpanded() || undefined} data-vc-selected={item.isSelected() || undefined} data-vc-focused={item.isFocused() || undefined}>
      {item.isFolder() && <span aria-hidden="true" data-vc-tree-indicator>{item.isExpanded() ? "−" : "+"}</span>}
      {node.icon && <span aria-hidden="true" data-vc-tree-icon>{node.icon}</span>}
      <span data-vc-tree-label>{node.label}</span>{node.metadata && <span data-vc-tree-metadata>{node.metadata}</span>}
    </button>;
  })}</div>;
}
