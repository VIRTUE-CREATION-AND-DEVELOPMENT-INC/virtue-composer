"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type ToastAction = { label: string; altText: string; onAction: () => void };
export type ToastDescriptor = { id?: string; title: string; description?: string; tone?: "neutral" | "info" | "success" | "warning" | "danger"; duration?: number; action?: ToastAction };
type ToastContextValue = { toast: (toast: ToastDescriptor) => string; dismiss: (id: string) => void };
export type ToastProviderProps = { children: ReactNode; duration?: number; swipeDirection?: "right" | "left" | "up" | "down"; className?: string };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export default function ToastProvider({ children, duration = 5000, swipeDirection = "right", className }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<ToastDescriptor & { id: string }>>([]);
  const id = useRef(0);
  const dismiss = useCallback((toastId: string) => setToasts((current) => current.filter((toast) => toast.id !== toastId)), []);
  const toast = useCallback((descriptor: ToastDescriptor) => {
    id.current += 1;
    const toastId = descriptor.id ?? `vc-toast-${id.current}`;
    setToasts((current) => [...current.filter((item) => item.id !== toastId), { ...descriptor, id: toastId }]);
    return toastId;
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitive.Provider duration={duration} swipeDirection={swipeDirection}>
        {children}
        {toasts.map((item) => (
          <ToastPrimitive.Root key={item.id} open duration={item.duration} onOpenChange={(open) => { if (!open) dismiss(item.id); }} className={className} data-vc-component="toast" data-vc-slot="root" data-vc-tone={item.tone ?? "neutral"}>
            <ToastPrimitive.Title>{item.title}</ToastPrimitive.Title>
            {item.description && <ToastPrimitive.Description>{item.description}</ToastPrimitive.Description>}
            {item.action && <ToastPrimitive.Action altText={item.action.altText} onClick={item.action.onAction}>{item.action.label}</ToastPrimitive.Action>}
            <ToastPrimitive.Close aria-label="Dismiss notification">Dismiss</ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport data-vc-toast-viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
