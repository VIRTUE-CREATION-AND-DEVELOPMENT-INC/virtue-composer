import type { ReactNode } from "react";
import Spinner from "./Spinner";

export type LoadingOverlayProps = { active: boolean; children: ReactNode; label?: string; indicator?: ReactNode; inertContent?: boolean; className?: string };

export default function LoadingOverlay({ active, children, label = "Loading", indicator, inertContent = true, className }: LoadingOverlayProps) {
  return <div className={className} data-vc-component="loading-overlay" data-vc-active={active || undefined} aria-busy={active || undefined}><div inert={active && inertContent ? true : undefined} data-vc-loading-content>{children}</div>{active && <div data-vc-loading-layer><div role="status" aria-label={label} data-vc-loading-status>{indicator ?? <span aria-hidden="true"><Spinner label={label} /></span>}<span>{label}</span></div></div>}</div>;
}
