import { isValidElement, type HTMLAttributes, type ReactNode } from "react";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  message?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

function isDescriptorObject(value: ReactNode) {
  if (typeof value !== "object" || value === null || isValidElement(value)) return false;
  return Object.getPrototypeOf(value) === Object.prototype && !("$$typeof" in value);
}

export default function EmptyState({ title, message, icon, actions, ...props }: EmptyStateProps) {
  const invalidActions = Array.isArray(actions) ? actions.some(isDescriptorObject) : isDescriptorObject(actions);
  if (invalidActions) throw new TypeError("EmptyState actions expects rendered React content. Render descriptor actions with <ActionGroup actions={...} /> and pass that element to EmptyState.");
  return (
    <div data-vc-component="empty-state" data-vc-slot="root" {...props}>
      {icon && <div data-vc-empty-icon aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actions && <div data-vc-empty-actions>{actions}</div>}
    </div>
  );
}
