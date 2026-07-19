"use client";

import type { ReactNode } from "react";
import Button from "./Button";
import ButtonLink from "./ButtonLink";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  getHref?: (page: number) => string;
  siblingCount?: number;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  ariaLabel?: string;
  className?: string;
};

function pageItems(page: number, pageCount: number, siblings: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  const visible = new Set([1, pageCount]);
  for (let candidate = Math.max(1, page - siblings); candidate <= Math.min(pageCount, page + siblings); candidate += 1) visible.add(candidate);
  const sorted = [...visible].sort((a, b) => a - b);
  const result: Array<number | "ellipsis-start" | "ellipsis-end"> = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push(index === 1 ? "ellipsis-start" : "ellipsis-end");
    result.push(value);
  });
  return result;
}

export default function Pagination({ page, pageCount, onPageChange, getHref, siblingCount = 1, previousLabel = "Previous", nextLabel = "Next", ariaLabel = "Pagination", className }: PaginationProps) {
  const boundedPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const renderControl = (target: number, label: ReactNode, current = false, disabled = false) => getHref && !disabled
    ? <ButtonLink href={getHref(target)} aria-current={current ? "page" : undefined} aria-label={current ? `Page ${target}, current page` : typeof label === "number" ? `Page ${label}` : undefined}>{label}</ButtonLink>
    : <Button disabled={disabled} aria-current={current ? "page" : undefined} aria-label={current ? `Page ${target}, current page` : typeof label === "number" ? `Page ${label}` : undefined} onClick={() => onPageChange?.(target)}>{label}</Button>;

  return (
    <nav aria-label={ariaLabel} className={className} data-vc-component="pagination">
      <ol data-vc-pagination-list>
        <li>{renderControl(boundedPage - 1, previousLabel, false, boundedPage <= 1)}</li>
        {pageItems(boundedPage, pageCount, siblingCount).map((item) => typeof item === "number"
          ? <li key={item}>{renderControl(item, item, item === boundedPage)}</li>
          : <li key={item}><span aria-hidden="true" data-vc-pagination-ellipsis>…</span></li>)}
        <li>{renderControl(boundedPage + 1, nextLabel, false, boundedPage >= pageCount)}</li>
      </ol>
    </nav>
  );
}
