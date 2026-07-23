"use client";

import { AsYouType, getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";
import { useId, useMemo, useState } from "react";
import { phoneCountryNames } from "./phoneCountryNames";

export type PhoneCountry = { code: CountryCode; label: string };
export type PhoneInputProps = { id?: string; label: string; value?: string; defaultValue?: string; onValueChange?: (value: string, valid: boolean) => void; defaultCountry?: CountryCode; countries?: PhoneCountry[]; name?: string; required?: boolean; disabled?: boolean; description?: string; error?: string; className?: string };

function countryOptions(): PhoneCountry[] {
  return getCountries().map((code) => ({ code, label: phoneCountryNames[code] })).sort((a, b) => a.label === b.label ? a.code < b.code ? -1 : 1 : a.label < b.label ? -1 : 1);
}

export default function PhoneInput({ id: providedId, label, value, defaultValue = "", onValueChange, defaultCountry = "CA", countries, name, required, disabled, description, error, className }: PhoneInputProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const options = useMemo(() => countries ?? countryOptions(), [countries]);
  const initial = parsePhoneNumberFromString(value ?? defaultValue);
  const [country, setCountry] = useState<CountryCode>(initial?.country ?? defaultCountry);
  const [internal, setInternal] = useState(value ?? defaultValue);
  const current = value ?? internal;
  const valid = current ? isValidPhoneNumber(current, country) : false;
  const commit = (raw: string, nextCountry = country) => {
    const formatted = new AsYouType(nextCountry).input(raw);
    if (value === undefined) setInternal(formatted);
    const parsed = parsePhoneNumberFromString(formatted, nextCountry);
    onValueChange?.(parsed?.number ?? formatted, Boolean(parsed?.isValid()));
  };
  return <div className={className} data-vc-component="phone-input" data-vc-slot="root" data-vc-valid={current ? valid : undefined} data-vc-invalid={Boolean(error) || undefined}>
    <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {description && <p id={`${id}-description`}>{description}</p>}
    <div data-vc-phone-controls>
      <label><span>Country</span><select aria-label={`${label} country`} value={country} onChange={(event) => { const next = event.currentTarget.value as CountryCode; setCountry(next); commit(current, next); }} disabled={disabled}>
        {options.map((option) => <option key={option.code} value={option.code}>{option.label} (+{getCountryCallingCode(option.code)})</option>)}
      </select></label>
      <input id={id} type="tel" inputMode="tel" autoComplete="tel" value={current} onChange={(event) => commit(event.currentTarget.value)} required={required} disabled={disabled} aria-describedby={[description ? `${id}-description` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined} aria-invalid={Boolean(error) || undefined} />
    </div>
    {name && <input type="hidden" name={name} value={parsePhoneNumberFromString(current, country)?.number ?? current} />}
    {error && <p id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}
