"use client";

import type { CSSProperties, ReactNode } from "react";
import Button from "./Button";
import ButtonLink from "./ButtonLink";

export type ActionDescriptor = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  external?: boolean;
  className?: string;
};

export type ActionGroupProps = {
  actions?: ActionDescriptor[];
  onAction?: (action: ActionDescriptor) => void;
  align?: "start" | "center" | "end" | "between";
  wrap?: boolean;
  className?: string;
  ariaLabel?: string;
};

const alignment: Record<NonNullable<ActionGroupProps["align"]>, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};

export default function ActionGroup({ actions = [], onAction, align = "start", wrap = true, className, ariaLabel = "Actions" }: ActionGroupProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      data-vc-component="action-group"
      style={{ display: "flex", alignItems: "center", justifyContent: alignment[align], flexWrap: wrap ? "wrap" : "nowrap", gap: "var(--vc-gap-small)" }}
    >
      {actions.map((action) =>
        action.href ? (
          <ButtonLink
            key={action.id}
            href={action.href}
            icon={action.icon}
            iconPosition={action.iconPosition}
            className={action.className}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noreferrer" : undefined}
          >
            {action.label}
          </ButtonLink>
        ) : (
          <Button
            key={action.id}
            icon={action.icon}
            iconPosition={action.iconPosition}
            disabled={action.disabled}
            loading={action.loading}
            loadingLabel={action.loadingLabel}
            className={action.className}
            onClick={() => onAction?.(action)}
          >
            {action.label}
          </Button>
        ),
      )}
    </div>
  );
}
