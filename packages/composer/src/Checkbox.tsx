"use client";

import { useId, type InputHTMLAttributes } from "react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
};

export default function Checkbox({ label, description, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;

  return (
    <div data-vc-component="checkbox">
      <label htmlFor={controlId} data-vc-choice-label>
        <input id={controlId} type="checkbox" aria-describedby={descriptionId} {...props} />
        <span data-vc-checkbox-mark aria-hidden="true" />
        <span>{label}</span>
      </label>
      {description && <p id={descriptionId} data-vc-choice-description>{description}</p>}
    </div>
  );
}
