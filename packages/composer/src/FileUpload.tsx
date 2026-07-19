"use client";

import { useId, useState, type DragEvent, type InputHTMLAttributes } from "react";

export type FileUploadProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & { label: string; description?: string; dropLabel?: string; maxSize?: number; onFilesChange?: (files: File[]) => void; error?: string; className?: string };

export default function FileUpload({ label, description, dropLabel = "Choose files or drop them here", maxSize, onFilesChange, error, id, className, multiple, accept, ...props }: FileUploadProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const commit = (files: File[]) => {
    const accepted = maxSize ? files.filter((file) => file.size <= maxSize) : files;
    setFileNames(accepted.map((file) => file.name));
    onFilesChange?.(accepted);
  };
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    commit(Array.from(event.dataTransfer.files));
  };

  return (
    <div className={className} data-vc-component="file-upload" data-vc-dragging={dragging || undefined} data-vc-invalid={Boolean(error) || undefined}>
      <span data-vc-file-upload-label>{label}</span>
      {description && <p id={descriptionId} data-vc-file-upload-description>{description}</p>}
      <label htmlFor={controlId} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop} data-vc-file-upload-dropzone>
        <span>{dropLabel}</span>
        <input {...props} id={controlId} type="file" multiple={multiple} accept={accept} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined} aria-invalid={error ? true : undefined} onChange={(event) => commit(Array.from(event.currentTarget.files ?? []))} />
      </label>
      {fileNames.length > 0 && <ul aria-label="Selected files" data-vc-file-upload-list>{fileNames.map((name) => <li key={name}>{name}</li>)}</ul>}
      {error && <p id={errorId} data-vc-file-upload-error>{error}</p>}
    </div>
  );
}
