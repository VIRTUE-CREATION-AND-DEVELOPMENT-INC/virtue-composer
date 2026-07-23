"use client";

import { useId, type ReactNode } from "react";
import useControllableState from "./useControllableState";

export type SelectableCardItem = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
};

export type SelectableCardGroupProps = {
  label: ReactNode;
  description?: ReactNode;
  items: SelectableCardItem[];
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function SelectableCardGroup({
  label,
  description,
  items,
  type = "single",
  value,
  defaultValue = type === "multiple" ? [] : "",
  onValueChange,
  name,
  required,
  disabled,
  className,
}: SelectableCardGroupProps) {
  const generatedName = useId();
  const descriptionId = useId();
  const fieldName = name ?? `selectable-card-${generatedName}`;
  const [selected, setSelected] = useControllableState<string | string[]>({ value, defaultValue, onChange: onValueChange });
  const singleValue = typeof selected === "string" ? selected : "";
  const multipleValues = Array.isArray(selected) ? selected : [];

  const change = (itemValue: string, checked: boolean) => {
    if (type === "single") {
      if (checked) setSelected(itemValue);
      return;
    }
    setSelected(checked
      ? multipleValues.includes(itemValue) ? multipleValues : [...multipleValues, itemValue]
      : multipleValues.filter((current) => current !== itemValue));
  };

  const hasSelection = type === "single" ? Boolean(singleValue) : multipleValues.length > 0;

  return (
    <fieldset
      className={className}
      aria-describedby={description ? descriptionId : undefined}
      disabled={disabled}
      data-vc-component="selectable-card-group"
      data-vc-slot="root"
      data-vc-type={type}
      data-vc-state={disabled ? "disabled" : hasSelection ? "selected" : "empty"}
    >
      <legend data-vc-slot="label">{label}{required && <span aria-hidden="true"> *</span>}</legend>
      {description && <p id={descriptionId} data-vc-slot="description">{description}</p>}
      <div data-vc-slot="items">
        {items.map((item) => {
          const checked = type === "single" ? singleValue === item.value : multipleValues.includes(item.value);
          return (
            <label key={item.value} data-vc-slot="item" data-vc-selected={checked || undefined} data-vc-disabled={item.disabled || disabled || undefined}>
              <input
                type={type === "single" ? "radio" : "checkbox"}
                name={fieldName}
                value={item.value}
                checked={checked}
                required={type === "single" ? required : undefined}
                disabled={disabled || item.disabled}
                onChange={(event) => change(item.value, event.currentTarget.checked)}
                data-vc-slot="control"
              />
              {item.leading && <span aria-hidden="true" data-vc-slot="leading">{item.leading}</span>}
              <span data-vc-slot="copy">
                <span data-vc-slot="item-label">{item.label}</span>
                {item.description && <small data-vc-slot="item-description">{item.description}</small>}
              </span>
              {item.trailing && <span data-vc-slot="trailing">{item.trailing}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
