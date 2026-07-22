"use client";

import { OTPInput as InputOtp, type RenderProps } from "input-otp";

export type OtpInputProps = { label: string; value?: string; defaultValue?: string; onChange?: (value: string) => void; length?: number; name?: string; disabled?: boolean; required?: boolean; pattern?: string; description?: string; error?: string; className?: string };

export default function OtpInput({ label, value, defaultValue, onChange, length = 6, name, disabled, required, pattern, description, error, className }: OtpInputProps) {
  const render = ({ slots }: RenderProps) => <div data-vc-otp-slots>{slots.map((slot, index) => <div key={index} aria-hidden="true" data-vc-otp-slot data-vc-active={slot.isActive || undefined}>{slot.char}{slot.hasFakeCaret && <span data-vc-otp-caret />}</div>)}</div>;
  return <label className={className} data-vc-component="otp-input" data-vc-slot="root" data-vc-invalid={Boolean(error) || undefined}><span>{label}{required && <span aria-hidden="true"> *</span>}</span>{description && <small>{description}</small>}<InputOtp value={value} defaultValue={defaultValue} onChange={onChange} maxLength={length} name={name} disabled={disabled} required={required} pattern={pattern} aria-invalid={Boolean(error) || undefined} render={render} />{error && <small role="alert" data-vc-otp-error>{error}</small>}</label>;
}
