"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { useEffect, useState, type ReactElement } from "react";
import Button from "./Button";
import type { GalleryImage } from "./ImageGallery";
import useControllableState from "./useControllableState";

export type LightboxProps = { images: GalleryImage[]; trigger: ReactElement; initialId?: string; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; ariaLabel?: string; className?: string };

export default function Lightbox({ images, trigger, initialId, open, defaultOpen, onOpenChange, ariaLabel = "Image viewer", className }: LightboxProps) {
  const [index, setIndex] = useState(() => Math.max(0, images.findIndex((image) => image.id === initialId)));
  const [resolvedOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen ?? false, onChange: onOpenChange });
  const current = images[index];
  const previous = () => setIndex((value) => (value - 1 + images.length) % images.length);
  const next = () => setIndex((value) => (value + 1) % images.length);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === "ArrowLeft") previous(); if (event.key === "ArrowRight") next(); };
    if (resolvedOpen) document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [resolvedOpen, images.length]);
  if (!current) return null;
  return <DialogPrimitive.Root open={resolvedOpen} onOpenChange={setOpen}><DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger><DialogPrimitive.Portal>
    <DialogPrimitive.Overlay data-vc-lightbox-overlay data-vc-slot="overlay" />
    <DialogPrimitive.Content aria-label={ariaLabel} className={className} data-vc-component="lightbox" data-vc-slot="root" data-vc-state="open" data-vc-selected-id={current.id}>
      <DialogPrimitive.Title data-vc-component="visually-hidden" data-vc-slot="title">{ariaLabel}</DialogPrimitive.Title>
      <figure data-vc-slot="figure"><Image src={current.src} alt={current.alt} width={current.width} height={current.height} data-vc-slot="image" />{current.caption && <figcaption data-vc-slot="caption">{current.caption}</figcaption>}</figure>
      <div data-vc-lightbox-controls data-vc-slot="controls">{images.length > 1 && <><Button onClick={previous} data-vc-slot="previous">Previous</Button><span aria-live="polite" data-vc-slot="position">{index + 1} of {images.length}</span><Button onClick={next} data-vc-slot="next">Next</Button></>}<DialogPrimitive.Close asChild><Button data-vc-slot="close">Close</Button></DialogPrimitive.Close></div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal></DialogPrimitive.Root>;
}
