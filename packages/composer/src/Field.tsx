"use client";

import { cloneElement, isValidElement, useId, type HTMLAttributes, type ReactElement } from "react";

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactElement<Record<string, unknown>>;
};

export default function Field({ label, description, error, required, children, ...props }: FieldProps) {
  const generatedId = useId();
  const controlId = String(children.props.id ?? generatedId);
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        required,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : children.props["aria-invalid"],
      })
    : children;

  return (
    <div data-vc-component="field" data-vc-invalid={Boolean(error) || undefined} {...props}>
      <label htmlFor={controlId} data-vc-field-label>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {description && <p id={descriptionId} data-vc-field-description>{description}</p>}
      {control}
      {error && <p id={errorId} data-vc-field-error>{error}</p>}
    </div>
  );
}
