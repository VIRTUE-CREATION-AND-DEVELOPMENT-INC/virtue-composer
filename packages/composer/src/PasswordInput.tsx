"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

export type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; description?: string; error?: string; showLabel?: string; hideLabel?: string; showIcon?: ReactNode; hideIcon?: ReactNode; className?: string };

export default function PasswordInput({ label, description, error, showLabel = "Show password", hideLabel = "Hide password", showIcon, hideIcon, id, className, required, ...props }: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  return <div className={className} data-vc-component="password-input" data-vc-slot="root" data-vc-invalid={Boolean(error) || undefined}>
    <label htmlFor={inputId}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={`${inputId}-description`}>{description}</p>}
    <div data-vc-password-control><input {...props} id={inputId} type={visible ? "text" : "password"} required={required} aria-describedby={description ? `${inputId}-description` : undefined} aria-invalid={Boolean(error) || undefined} /><button type="button" aria-label={visible ? hideLabel : showLabel} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>{visible ? hideIcon ?? hideLabel : showIcon ?? showLabel}</button></div>
    {error && <p role="alert" data-vc-password-error>{error}</p>}
  </div>;
}
