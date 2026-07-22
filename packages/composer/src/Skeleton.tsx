import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  shape?: "line" | "block" | "circle";
  label?: string;
};

export default function Skeleton({ shape = "line", label = "Loading content", ...props }: SkeletonProps) {
  return <span aria-hidden="true" title={label} data-vc-component="skeleton" data-vc-slot="root" data-vc-shape={shape} {...props} />;
}
