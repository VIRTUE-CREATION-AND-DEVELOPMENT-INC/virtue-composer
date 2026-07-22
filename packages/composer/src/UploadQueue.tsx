import type { ReactNode } from "react";

export type UploadQueueItem = { id: string; name: string; status: "queued" | "uploading" | "complete" | "error" | "cancelled"; progress?: number; size?: string; error?: ReactNode; preview?: ReactNode };
export type UploadQueueProps = { items: UploadQueueItem[]; onRetry?: (id: string) => void; onRemove?: (id: string) => void; onCancel?: (id: string) => void; ariaLabel?: string; className?: string };

export default function UploadQueue({ items, onRetry, onRemove, onCancel, ariaLabel = "Upload queue", className }: UploadQueueProps) {
  const active = items.filter((item) => item.status === "uploading").length;
  const failed = items.some((item) => item.status === "error");
  return <section aria-label={ariaLabel} className={className} data-vc-component="upload-queue" data-vc-slot="root" data-vc-state={failed ? "error" : active > 0 ? "uploading" : items.length === 0 ? "empty" : "idle"}>
    <p role="status" aria-live="polite" data-vc-upload-summary data-vc-slot="summary">{active > 0 ? `${active} uploading` : `${items.length} files`}</p>
    <ul data-vc-slot="list">{items.map((item) => {
      const progress = Math.max(0, Math.min(100, item.progress ?? (item.status === "complete" ? 100 : 0)));
      return <li key={item.id} data-vc-upload-item data-vc-slot="item" data-vc-status={item.status}>
        {item.preview && <span data-vc-slot="preview">{item.preview}</span>}<span data-vc-slot="copy"><strong data-vc-slot="name">{item.name}</strong>{item.size && <small data-vc-slot="size">{item.size}</small>}</span>
        <span data-vc-slot="status">{item.status}</span>
        {(item.status === "uploading" || item.status === "complete") && <progress value={progress} max={100} aria-label={`${item.name} upload progress`} data-vc-slot="progress">{progress}%</progress>}
        {item.error && <span role="alert" data-vc-slot="error">{item.error}</span>}
        {item.status === "error" && onRetry && <button type="button" onClick={() => onRetry(item.id)} data-vc-slot="retry">Retry {item.name}</button>}
        {item.status === "uploading" && onCancel && <button type="button" onClick={() => onCancel(item.id)} data-vc-slot="cancel">Cancel {item.name}</button>}
        {onRemove && item.status !== "uploading" && <button type="button" onClick={() => onRemove(item.id)} data-vc-slot="remove">Remove {item.name}</button>}
      </li>;
    })}</ul>
  </section>;
}
