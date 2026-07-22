"use client";

import { useState } from "react";

type ControllableStateOptions<Value> = {
  value: Value | undefined;
  defaultValue: Value;
  onChange?: (value: Value) => void;
};

export default function useControllableState<Value>({ value, defaultValue, onChange }: ControllableStateOptions<Value>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value === undefined ? internalValue : value;

  const setValue = (nextValue: Value) => {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  return [currentValue, setValue] as const;
}
