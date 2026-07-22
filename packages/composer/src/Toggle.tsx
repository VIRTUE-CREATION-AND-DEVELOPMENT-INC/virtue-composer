"use client";

import * as Switch from "@radix-ui/react-switch";
import { useId, type HTMLAttributes } from "react";

export type ToggleProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultChecked"> & {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export default function Toggle({ label, description, checked, defaultChecked, onCheckedChange, disabled, ...props }: ToggleProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div data-vc-component="toggle" data-vc-slot="root" {...props}>
      <div>
        <label htmlFor={id}>{label}</label>
        {description && <p id={descriptionId}>{description}</p>}
      </div>
      <Switch.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={descriptionId}
        data-vc-toggle-root
      >
        <Switch.Thumb data-vc-toggle-thumb />
      </Switch.Root>
    </div>
  );
}
