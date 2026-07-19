"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useState, type ReactElement } from "react";
import Button from "./Button";
import type { GalleryImage } from "./ImageGallery";

export type LightboxProps = { images: GalleryImage[]; trigger: ReactElement; initialId?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; ariaLabel?: string; className?: string };

export default function Lightbox({ images, trigger, initialId, open, defaultOpen, onOpenChange, ariaLabel = "Image viewer", className }: LightboxProps) {
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex((image) => image.id === initialId)));
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const resolvedOpen = open ?? internalOpen;
  const current = images[index];
  const previous = () => setIndex((value) => (value - 1 + images.length) % images.length);
  const next = () => setIndex((value) => (value + 1) % images.length);
  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === "ArrowLeft") previous(); if (event.key === "ArrowRight") next(); };
    if (resolvedOpen) document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [resolvedOpen, images.length]);
  if (!current) return null;
  return <DialogPrimitive.Root open={resolvedOpen} onOpenChange={handleOpenChange}><DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger><DialogPrimitive.Portal><DialogPrimitive.Overlay data-vc-lightbox-overlay /><DialogPrimitive.Content aria-label={ariaLabel} className={className} data-vc-component="lightbox"><DialogPrimitive.Title data-vc-component="visually-hidden">{ariaLabel}</DialogPrimitive.Title><figure><Image src={current.src} alt={current.alt} width={current.width} height={current.height} />{current.caption && <figcaption>{current.caption}</figcaption>}</figure><div data-vc-lightbox-controls>{images.length > 1 && <><Button onClick={previous}>Previous</Button><span aria-live="polite">{index + 1} of {images.length}</span><Button onClick={next}>Next</Button></>}<DialogPrimitive.Close asChild><Button>Close</Button></DialogPrimitive.Close></div></DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}
