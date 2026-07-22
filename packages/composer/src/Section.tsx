import { createElement, type ComponentPropsWithoutRef, type CSSProperties, type ElementType } from "react";

type Layout = "block" | "flex" | "grid";
type Direction = "row" | "column";
type Alignment = "start" | "center" | "end" | "stretch";
type Justification = "start" | "center" | "end" | "between" | "around" | "evenly";
type Gap = "none" | "small" | "medium" | "large" | "section";

type SectionOwnProps<T extends ElementType> = {
  as?: T;
  layout?: Layout;
  direction?: Direction;
  align?: Alignment;
  justify?: Justification;
  wrap?: boolean;
  columns?: number | string;
  gap?: Gap;
  className?: string;
  style?: never;
};

export type SectionProps<T extends ElementType = "section"> = SectionOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SectionOwnProps<T>>;

export default function Section<T extends ElementType = "section">({
  as,
  layout = "block",
  direction = "row",
  align,
  justify,
  wrap = false,
  columns,
  gap = "none",
  className,
  style: _projectStyle,
  ...props
}: SectionProps<T>) {
  if (_projectStyle !== undefined) {
    console.error("Virtue Composer: Section does not accept style. Move visual and dimensional styling to the project styling layer.");
  }
  const element = as ?? "section";
  const layoutStyle = layout === "grid" && columns
    ? ({ "--vc-section-columns": typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns } as CSSProperties)
    : undefined;

  return createElement(element, {
    ...props,
    className,
    style: layoutStyle,
    "data-vc-component": "section",
    "data-vc-slot": "root",
    "data-vc-layout": layout,
    "data-vc-direction": layout === "flex" ? direction : undefined,
    "data-vc-align": align,
    "data-vc-justify": justify,
    "data-vc-wrap": layout === "flex" ? wrap : undefined,
    "data-vc-columns": layout === "grid" && columns ? true : undefined,
    "data-vc-gap": gap,
  });
}
