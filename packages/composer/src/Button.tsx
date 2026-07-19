"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Spinner from "./Spinner";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  loading?: boolean;
  loadingLabel?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, icon, iconPosition = "start", loading = false, loadingLabel = "Working", disabled, type = "button", ...props },
  ref,
) {
  const content = loading ? loadingLabel : children;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-vc-component="button"
      data-vc-loading={loading || undefined}
      {...props}
    >
      {loading && <Spinner label={loadingLabel} size="small" />}
      {!loading && icon && iconPosition === "start" && <span data-vc-button-icon>{icon}</span>}
      {content && <span data-vc-button-label>{content}</span>}
      {!loading && icon && iconPosition === "end" && <span data-vc-button-icon>{icon}</span>}
    </button>
  );
});

export default Button;
