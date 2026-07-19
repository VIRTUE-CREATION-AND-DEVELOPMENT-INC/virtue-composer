import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, ...props }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} data-vc-component="input" data-vc-invalid={invalid || undefined} {...props} />;
});

export default Input;
