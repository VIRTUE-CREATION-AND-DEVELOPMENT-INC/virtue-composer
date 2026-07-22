import { forwardRef, useId, type InputHTMLAttributes } from "react";

export type TimeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; description?: string; error?: string; className?: string };

const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput({ label, description, error, className, id, required, ...props }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <div className={className} data-vc-component="time-input" data-vc-slot="root" data-vc-invalid={Boolean(error) || undefined}><label htmlFor={inputId}>{label}{required && <span aria-hidden="true"> *</span>}</label>{description && <p id={`${inputId}-description`}>{description}</p>}<input {...props} ref={ref} id={inputId} type="time" required={required} aria-describedby={description ? `${inputId}-description` : undefined} aria-invalid={Boolean(error) || undefined} />{error && <p role="alert" data-vc-time-error>{error}</p>}</div>;
});

export default TimeInput;
