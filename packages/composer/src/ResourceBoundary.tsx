import type { ReactNode } from "react";
import Button from "./Button";
import Callout from "./Callout";
import EmptyState from "./EmptyState";
import Spinner from "./Spinner";

export type ResourceBoundaryProps = { status: "loading" | "error" | "empty" | "ready"; children?: ReactNode; loadingLabel?: string; loading?: ReactNode; errorTitle?: string; errorMessage?: string; error?: ReactNode; onRetry?: () => void; emptyTitle?: string; emptyMessage?: string; empty?: ReactNode; className?: string };

export default function ResourceBoundary({ status, children, loadingLabel = "Loading", loading, errorTitle = "Unable to load", errorMessage, error, onRetry, emptyTitle = "Nothing here yet", emptyMessage, empty, className }: ResourceBoundaryProps) {
  let content = children;
  if (status === "loading") content = loading ?? <Spinner label={loadingLabel} />;
  if (status === "error") content = error ?? <Callout title={errorTitle} tone="danger" actions={onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined}>{errorMessage}</Callout>;
  if (status === "empty") content = empty ?? <EmptyState title={emptyTitle} message={emptyMessage} />;
  return <div aria-busy={status === "loading" || undefined} data-vc-component="resource-boundary" data-vc-slot="root" data-vc-status={status} className={className}>{content}</div>;
}
