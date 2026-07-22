import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, ...props }, ref) {
  return <select ref={ref} aria-invalid={invalid || undefined} data-vc-component="select" data-vc-slot="root" data-vc-invalid={invalid || undefined} {...props} />;
});

export default Select;
