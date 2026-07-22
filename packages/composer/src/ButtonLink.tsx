import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export type ButtonLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    icon?: ReactNode;
    iconPosition?: "start" | "end";
  };

export default function ButtonLink({ children, icon, iconPosition = "start", ...props }: ButtonLinkProps) {
  return (
    <Link data-vc-component="button-link" data-vc-slot="root" {...props}>
      {icon && iconPosition === "start" && <span data-vc-button-icon>{icon}</span>}
      {children && <span data-vc-button-label>{children}</span>}
      {icon && iconPosition === "end" && <span data-vc-button-icon>{icon}</span>}
    </Link>
  );
}
