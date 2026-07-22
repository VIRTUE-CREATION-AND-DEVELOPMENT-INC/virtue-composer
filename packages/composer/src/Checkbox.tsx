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
    <div data-vc-component="checkbox" data-vc-slot="root">
      <label htmlFor={controlId} data-vc-choice-label data-vc-slot="label">
        <input id={controlId} type="checkbox" aria-describedby={descriptionId} data-vc-slot="control" {...props} />
        <span data-vc-checkbox-mark data-vc-slot="indicator" aria-hidden="true" />
        <span data-vc-slot="text">{label}</span>
      </label>
      {description && <p id={descriptionId} data-vc-choice-description data-vc-slot="description">{description}</p>}
    </div>
  );
}
