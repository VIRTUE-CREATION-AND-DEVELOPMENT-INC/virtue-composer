import type { ReactNode } from "react";

export type DocumentPreviewProps = { src: string; title: string; type?: "pdf" | "image" | "other"; downloadName?: string; fallback?: ReactNode; className?: string };

export default function DocumentPreview({ src, title, type = "pdf", downloadName, fallback, className }: DocumentPreviewProps) {
  return <figure className={className} data-vc-component="document-preview" data-vc-type={type}>
    {type === "image" ? <img src={src} alt={title} /> : type === "pdf" ? <iframe src={src} title={title} /> : fallback ?? <p>Preview unavailable.</p>}
    <figcaption><span>{title}</span> <a href={src} download={downloadName}>Download {title}</a></figcaption>
  </figure>;
}
