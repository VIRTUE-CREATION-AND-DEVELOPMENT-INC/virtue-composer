"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Button from "./Button";
import VisuallyHidden from "./VisuallyHidden";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { label: string; icon: ReactNode; loading?: boolean; loadingLabel?: string };

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, icon, loading, loadingLabel, ...props }, ref) {
  return <Button {...props} ref={ref} aria-label={label} icon={icon} loading={loading} loadingLabel={loadingLabel} data-vc-component="icon-button"><VisuallyHidden>{label}</VisuallyHidden></Button>;
});

export default IconButton;
