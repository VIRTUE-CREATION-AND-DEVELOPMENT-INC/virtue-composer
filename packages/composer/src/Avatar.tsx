"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ReactNode } from "react";

export type AvatarProps = { src?: string; alt: string; fallback: ReactNode; fallbackDelay?: number; className?: string };

export default function Avatar({ src, alt, fallback, fallbackDelay = 300, className }: AvatarProps) {
  return <AvatarPrimitive.Root className={className} data-vc-component="avatar" data-vc-slot="root">{src && <AvatarPrimitive.Image src={src} alt={alt} data-vc-avatar-image />}<AvatarPrimitive.Fallback delayMs={fallbackDelay} aria-label={!src ? alt : undefined} data-vc-avatar-fallback>{fallback}</AvatarPrimitive.Fallback></AvatarPrimitive.Root>;
}
