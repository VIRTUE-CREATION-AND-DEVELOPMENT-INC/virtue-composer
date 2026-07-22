"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type { ReactNode } from "react";

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; disabled?: boolean };
export type AccordionProps = { items: AccordionItem[]; type?: "single" | "multiple"; value?: string | string[]; defaultValue?: string | string[]; onValueChange?: (value: string | string[]) => void; collapsible?: boolean; className?: string };

function Items({ items }: { items: AccordionItem[] }) {
  return items.map((item) => (
    <AccordionPrimitive.Item key={item.id} value={item.id} disabled={item.disabled} data-vc-accordion-item>
      <AccordionPrimitive.Header data-vc-accordion-header>
        <AccordionPrimitive.Trigger data-vc-accordion-trigger><span data-vc-accordion-title>{item.title}</span><span aria-hidden="true" data-vc-accordion-indicator>+</span></AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content data-vc-accordion-content>{item.content}</AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  ));
}

export default function Accordion({ items, type = "single", value, defaultValue, onValueChange, collapsible = true, className }: AccordionProps) {
  if (type === "multiple") {
    return <AccordionPrimitive.Root type="multiple" value={value as string[] | undefined} defaultValue={defaultValue as string[] | undefined} onValueChange={onValueChange} className={className} data-vc-component="accordion" data-vc-slot="root"><Items items={items} /></AccordionPrimitive.Root>;
  }
  return <AccordionPrimitive.Root type="single" value={value as string | undefined} defaultValue={defaultValue as string | undefined} onValueChange={onValueChange} collapsible={collapsible} className={className} data-vc-component="accordion" data-vc-slot="root"><Items items={items} /></AccordionPrimitive.Root>;
}
