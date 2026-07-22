import type { HTMLAttributes, ReactNode } from "react";

export type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  actions?: ReactNode;
};

export default function Callout({ title, tone = "neutral", actions, children, role, ...props }: CalloutProps) {
  const resolvedRole = role ?? (tone === "danger" ? "alert" : tone === "success" || tone === "warning" ? "status" : undefined);

  return (
    <div role={resolvedRole} data-vc-component="callout" data-vc-slot="root" data-vc-tone={tone} {...props}>
      <div data-vc-callout-copy>
        <h3>{title}</h3>
        {children}
      </div>
      {actions && <div data-vc-callout-actions>{actions}</div>}
    </div>
  );
}
