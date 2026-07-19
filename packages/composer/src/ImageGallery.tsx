"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryImage = { id: string; src: string; alt: string; width: number; height: number; caption?: string; thumbnailSrc?: string };
export type ImageGalleryProps = { images: GalleryImage[]; selectedId?: string; defaultSelectedId?: string; onSelectedIdChange?: (id: string) => void; priority?: boolean; ariaLabel?: string; empty?: React.ReactNode; className?: string };

export default function ImageGallery({ images, selectedId, defaultSelectedId, onSelectedIdChange, priority = false, ariaLabel = "Image gallery", empty, className }: ImageGalleryProps) {
  const [internal, setInternal] = useState(defaultSelectedId ?? images[0]?.id ?? "");
  if (images.length === 0) return <div className={className} data-vc-component="image-gallery" data-vc-empty>{empty}</div>;
  const currentId = selectedId ?? internal;
  const current = images.find((image) => image.id === currentId) ?? images[0];
  const select = (id: string) => { if (selectedId === undefined) setInternal(id); onSelectedIdChange?.(id); };
  return <section aria-label={ariaLabel} className={className} data-vc-component="image-gallery"><figure data-vc-gallery-primary><Image src={current.src} alt={current.alt} width={current.width} height={current.height} priority={priority} />{current.caption && <figcaption>{current.caption}</figcaption>}</figure><div role="list" aria-label="Choose image" data-vc-gallery-thumbnails>{images.map((image) => <div key={image.id} role="listitem"><button type="button" aria-label={`Show ${image.alt}`} aria-current={image.id === current.id ? "true" : undefined} onClick={() => select(image.id)} data-vc-gallery-thumbnail><Image src={image.thumbnailSrc ?? image.src} alt="" width={image.width} height={image.height} /></button></div>)}</div></section>;
}
