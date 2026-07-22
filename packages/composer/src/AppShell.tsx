import type { ReactNode } from "react";

export type AppShellProps = {
  header?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  mainId?: string;
  skipLinkLabel?: string;
  className?: string;
};

export default function AppShell({ header, navigation, children, footer, mainId = "main-content", skipLinkLabel = "Skip to main content", className }: AppShellProps) {
  return (
    <div className={className} data-vc-component="app-shell" data-vc-slot="root">
      <a href={`#${mainId}`} data-vc-app-shell-skip>{skipLinkLabel}</a>
      {header && <header data-vc-app-shell-header>{header}</header>}
      <div data-vc-app-shell-body>
        {navigation && <aside data-vc-app-shell-navigation>{navigation}</aside>}
        <main id={mainId} tabIndex={-1} data-vc-app-shell-main>{children}</main>
      </div>
      {footer && <footer data-vc-app-shell-footer>{footer}</footer>}
    </div>
  );
}
