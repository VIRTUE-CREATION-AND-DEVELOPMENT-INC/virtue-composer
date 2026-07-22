import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, ...props }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} data-vc-component="textarea" data-vc-slot="root" data-vc-invalid={invalid || undefined} {...props} />;
});

export default Textarea;
