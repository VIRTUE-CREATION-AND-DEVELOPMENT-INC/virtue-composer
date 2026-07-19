"use client";

import { useEffect, useId, useMemo, useState } from "react";

export type CurrencyInputProps = { label: string; currency: string; locale?: string; value?: number; defaultValue?: number; onValueChange?: (minorUnits: number | undefined) => void; min?: number; max?: number; name?: string; required?: boolean; disabled?: boolean; description?: string; error?: string; className?: string };

export default function CurrencyInput({ label, currency, locale, value, defaultValue, onValueChange, min, max, name, required, disabled, description, error, className }: CurrencyInputProps) {
  const id = useId();
  const formatter = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const divisor = 10 ** digits;
  const format = (minor?: number) => minor === undefined ? "" : formatter.format(minor / divisor);
  const [text, setText] = useState(format(value ?? defaultValue));
  useEffect(() => { if (value !== undefined) setText(format(value)); }, [value, formatter, divisor]);
  const parse = (raw: string) => {
    const parts = formatter.formatToParts(1234.5);
    const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
    const normalized = raw.replace(new RegExp(`[^0-9\\${decimal}-]`, "g"), "").replace(decimal, ".");
    if (!normalized || normalized === "-") return undefined;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return undefined;
    return Math.round(parsed * divisor);
  };
  const change = (raw: string) => {
    setText(raw);
    const next = parse(raw);
    const bounded = next === undefined ? undefined : Math.max(min ?? next, Math.min(max ?? next, next));
    onValueChange?.(bounded);
  };
  const minor = parse(text);
  return <div className={className} data-vc-component="currency-input" data-vc-invalid={Boolean(error) || undefined}>
    <label htmlFor={id}>{label} ({currency}){required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={`${id}-description`}>{description}</p>}
    <input id={id} type="text" inputMode="decimal" value={text} onChange={(event) => change(event.currentTarget.value)} onBlur={() => setText(format(parse(text)))} required={required} disabled={disabled} aria-describedby={[description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined} aria-invalid={Boolean(error) || undefined} />
    {name && <input type="hidden" name={name} value={minor ?? ""} />}
    {error && <p id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}
