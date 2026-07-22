import type { HTMLAttributes, ReactNode } from "react";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  message?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export default function EmptyState({ title, message, icon, actions, ...props }: EmptyStateProps) {
  return (
    <div data-vc-component="empty-state" data-vc-slot="root" {...props}>
      {icon && <div data-vc-empty-icon aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actions && <div data-vc-empty-actions>{actions}</div>}
    </div>
  );
}
