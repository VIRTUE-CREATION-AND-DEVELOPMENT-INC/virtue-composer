import type { HTMLAttributes } from "react";
import VisuallyHidden from "./VisuallyHidden";

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
  size?: "small" | "medium" | "large";
};

export default function Spinner({ label = "Loading", size = "medium", ...props }: SpinnerProps) {
  return (
    <span role="status" data-vc-component="spinner" data-vc-size={size} {...props}>
      <span data-vc-spinner-mark aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
