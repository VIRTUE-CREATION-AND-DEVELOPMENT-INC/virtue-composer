import type { ReactNode } from "react";

export type DocumentPreviewProps = { src: string; title: string; type?: "pdf" | "image" | "other"; downloadName?: string; fallback?: ReactNode; className?: string };

export default function DocumentPreview({ src, title, type = "pdf", downloadName, fallback, className }: DocumentPreviewProps) {
  return <figure className={className} data-vc-component="document-preview" data-vc-slot="root" data-vc-state={type === "other" ? "fallback" : "preview"} data-vc-type={type}>
    <div data-vc-slot="preview">{type === "image" ? <img src={src} alt={title} data-vc-slot="media" /> : type === "pdf" ? <iframe src={src} title={title} loading="lazy" data-vc-slot="media" /> : <div data-vc-slot="fallback">{fallback ?? <p>Preview unavailable.</p>}</div>}</div>
    <figcaption data-vc-slot="caption"><span data-vc-slot="title">{title}</span> <a href={src} download={downloadName} data-vc-slot="download">Download {title}</a></figcaption>
  </figure>;
}
