"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useId, type HTMLAttributes } from "react";

export type RadioOption = { label: string; value: string; description?: string; disabled?: boolean };
export type RadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  label: string;
  description?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
};

export default function RadioGroup({ label, description, options, value, defaultValue, onValueChange, name, required, disabled, error, id: providedId, ...props }: RadioGroupProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div id={id} data-vc-component="radio-group" data-vc-slot="root" data-vc-invalid={Boolean(error) || undefined} {...props}>
      <p id={labelId} data-vc-choice-heading>{label}{required && <span aria-hidden="true"> *</span>}</p>
      {description && <p id={descriptionId} data-vc-choice-description>{description}</p>}
      <RadioGroupPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        required={required}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
        aria-invalid={Boolean(error) || undefined}
        data-vc-radio-root
      >
        {options.map((option) => (
          <label key={option.value} data-vc-radio-option>
            <RadioGroupPrimitive.Item value={option.value} disabled={option.disabled} data-vc-radio-item>
              <RadioGroupPrimitive.Indicator data-vc-radio-indicator />
            </RadioGroupPrimitive.Item>
            <span>
              <span>{option.label}</span>
              {option.description && <small>{option.description}</small>}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive.Root>
      {error && <p id={errorId} role="alert" data-vc-choice-error>{error}</p>}
    </div>
  );
}
