export type HoneypotFieldProps = { name?: string; label?: string; className?: string };

export default function HoneypotField({ name = "website", label = "Leave this field empty", className }: HoneypotFieldProps) {
  return <div className={className} aria-hidden="true" inert data-vc-component="honeypot-field" data-vc-slot="root">
    <label>{label}<input type="text" name={name} tabIndex={-1} autoComplete="off" /></label>
  </div>;
}
