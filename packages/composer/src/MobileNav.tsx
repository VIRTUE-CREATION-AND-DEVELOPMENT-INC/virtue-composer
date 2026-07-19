"use client";

import type { ReactElement, ReactNode } from "react";
import Drawer from "./Drawer";
import SideNav, { type SideNavGroup } from "./SideNav";

export type MobileNavProps = {
  trigger: ReactElement;
  groups: SideNavGroup[];
  title?: string;
  description?: string;
  actions?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export default function MobileNav({ trigger, groups, title = "Navigation", description, actions, open, defaultOpen, onOpenChange, className }: MobileNavProps) {
  return <Drawer trigger={trigger} title={title} description={description} actions={actions} side="left" open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} className={className}><SideNav groups={groups} ariaLabel="Mobile navigation" /></Drawer>;
}
