"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Button from "./Button";

export type CopyButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onCopy"> & { value: string; label?: ReactNode; copiedLabel?: ReactNode; icon?: ReactNode; resetAfter?: number; onCopy?: (value: string) => void };

export default function CopyButton({ value, label = "Copy", copiedLabel = "Copied", icon, resetAfter = 2000, onCopy, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy?.(value);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), resetAfter);
  };
  return <Button {...props} icon={icon} onClick={copy} data-vc-component="copy-button" data-vc-copied={copied || undefined}><span aria-live="polite">{copied ? copiedLabel : label}</span></Button>;
}
