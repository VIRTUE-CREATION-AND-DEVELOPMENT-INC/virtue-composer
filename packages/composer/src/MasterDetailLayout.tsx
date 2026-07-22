import type { ReactNode } from "react";

export type MasterDetailLayoutProps = { master: ReactNode; detail: ReactNode; masterLabel?: string; detailLabel?: string; activePane?: "master" | "detail" | "both"; className?: string };

export default function MasterDetailLayout({ master, detail, masterLabel = "Items", detailLabel = "Details", activePane = "both", className }: MasterDetailLayoutProps) {
  return (
    <div className={className} data-vc-component="master-detail-layout" data-vc-slot="root" data-vc-active-pane={activePane}>
      <aside aria-label={masterLabel} data-vc-master-pane>{master}</aside>
      <section aria-label={detailLabel} data-vc-detail-pane>{detail}</section>
    </div>
  );
}
