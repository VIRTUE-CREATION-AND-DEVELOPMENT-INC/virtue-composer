import type { HTMLAttributes } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
};

export default function Badge({ tone = "neutral", ...props }: BadgeProps) {
  return <span data-vc-component="badge" data-vc-tone={tone} {...props} />;
}
