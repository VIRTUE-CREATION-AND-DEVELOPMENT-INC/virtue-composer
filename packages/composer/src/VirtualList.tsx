"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, type ReactNode } from "react";

export type VirtualListProps<Item> = { items: Item[]; renderItem: (item: Item, index: number) => ReactNode; getItemKey?: (item: Item, index: number) => string | number; estimateSize?: (index: number) => number; height?: number | string; overscan?: number; ariaLabel?: string; empty?: ReactNode; className?: string };

export default function VirtualList<Item>({ items, renderItem, getItemKey, estimateSize = () => 48, height = 320, overscan = 6, ariaLabel = "Items", empty, className }: VirtualListProps<Item>) {
  const parent = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({ count: items.length, getScrollElement: () => parent.current, estimateSize, overscan, getItemKey: (index) => getItemKey?.(items[index], index) ?? index, useFlushSync: false });
  if (items.length === 0) return <div className={className} data-vc-component="virtual-list" data-vc-empty>{empty}</div>;
  return <div ref={parent} role="list" aria-label={ariaLabel} tabIndex={0} className={className} style={{ height }} data-vc-component="virtual-list"><div style={{ height: virtualizer.getTotalSize(), position: "relative" }} data-vc-virtual-canvas>{virtualizer.getVirtualItems().map((virtualItem) => <div key={virtualItem.key} ref={virtualizer.measureElement} data-index={virtualItem.index} role="listitem" style={{ position: "absolute", insetInlineStart: 0, top: 0, width: "100%", transform: `translateY(${virtualItem.start}px)` }} data-vc-virtual-item>{renderItem(items[virtualItem.index], virtualItem.index)}</div>)}</div></div>;
}
