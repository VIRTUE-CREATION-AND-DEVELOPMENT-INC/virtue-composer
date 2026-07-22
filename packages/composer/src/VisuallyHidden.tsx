import { createElement, type ComponentPropsWithoutRef, type CSSProperties, type ElementType } from "react";

const hiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

type Props<T extends ElementType> = { as?: T } & Omit<ComponentPropsWithoutRef<T>, "as">;

export default function VisuallyHidden<T extends ElementType = "span">({ as, style, ...props }: Props<T>) {
  return createElement(as ?? "span", {
    ...props,
    style: { ...hiddenStyle, ...(style as CSSProperties) },
    "data-vc-component": "visually-hidden",
    "data-vc-slot": "root",
  });
}
