"use client";

import type { ReactNode } from "react";
import Button from "./Button";
import IconButton from "./IconButton";
import Menu, { type MenuItem } from "./Menu";

export type SplitButtonProps = { label: ReactNode; onClick: () => void; items: MenuItem[]; onAction?: (id: string) => void; icon?: ReactNode; menuIcon: ReactNode; menuLabel?: string; disabled?: boolean; loading?: boolean; className?: string };

export default function SplitButton({ label, onClick, items, onAction, icon, menuIcon, menuLabel = "More actions", disabled, loading, className }: SplitButtonProps) {
  return <div className={className} role="group" aria-label={typeof label === "string" ? label : "Split action"} data-vc-component="split-button" data-vc-slot="root"><Button icon={icon} onClick={onClick} disabled={disabled} loading={loading}>{label}</Button><Menu trigger={<IconButton label={menuLabel} icon={menuIcon} disabled={disabled || loading} />} items={items} onAction={onAction} ariaLabel={menuLabel} /></div>;
}
