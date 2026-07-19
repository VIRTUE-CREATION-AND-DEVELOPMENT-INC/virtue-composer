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
  disabled?: boolean;
};

export default function RadioGroup({ label, description, options, value, defaultValue, onValueChange, disabled, ...props }: RadioGroupProps) {
  const labelId = useId();
  const descriptionId = description ? `${labelId}-description` : undefined;

  return (
    <div data-vc-component="radio-group" {...props}>
      <p id={labelId} data-vc-choice-heading>{label}</p>
      {description && <p id={descriptionId} data-vc-choice-description>{description}</p>}
      <RadioGroupPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
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
    </div>
  );
}
