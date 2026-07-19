import type { ReactNode } from "react";

export type UploadQueueItem = { id: string; name: string; status: "queued" | "uploading" | "complete" | "error" | "cancelled"; progress?: number; size?: string; error?: ReactNode; preview?: ReactNode };
export type UploadQueueProps = { items: UploadQueueItem[]; onRetry?: (id: string) => void; onRemove?: (id: string) => void; onCancel?: (id: string) => void; ariaLabel?: string; className?: string };

export default function UploadQueue({ items, onRetry, onRemove, onCancel, ariaLabel = "Upload queue", className }: UploadQueueProps) {
  const active = items.filter((item) => item.status === "uploading").length;
  return <section aria-label={ariaLabel} className={className} data-vc-component="upload-queue">
    <p role="status" aria-live="polite" data-vc-upload-summary>{active > 0 ? `${active} uploading` : `${items.length} files`}</p>
    <ul>{items.map((item) => {
      const progress = Math.max(0, Math.min(100, item.progress ?? (item.status === "complete" ? 100 : 0)));
      return <li key={item.id} data-vc-upload-item data-vc-status={item.status}>
        {item.preview}<span><strong>{item.name}</strong>{item.size && <small>{item.size}</small>}</span>
        <span>{item.status}</span>
        {(item.status === "uploading" || item.status === "complete") && <progress value={progress} max={100} aria-label={`${item.name} upload progress`}>{progress}%</progress>}
        {item.error && <span role="alert">{item.error}</span>}
        {item.status === "error" && onRetry && <button type="button" onClick={() => onRetry(item.id)}>Retry {item.name}</button>}
        {item.status === "uploading" && onCancel && <button type="button" onClick={() => onCancel(item.id)}>Cancel {item.name}</button>}
        {onRemove && item.status !== "uploading" && <button type="button" onClick={() => onRemove(item.id)}>Remove {item.name}</button>}
      </li>;
    })}</ul>
  </section>;
}
