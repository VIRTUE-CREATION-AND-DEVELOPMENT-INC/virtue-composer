import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type BackLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { icon?: ReactNode };

export default function BackLink({ children = "Back", icon, ...props }: BackLinkProps) {
  return <Link {...props} data-vc-component="back-link">{icon && <span aria-hidden="true" data-vc-back-link-icon>{icon}</span>}<span>{children}</span></Link>;
}
