"use client";

import Image from "next/image";
import useControllableState from "./useControllableState";

export type GalleryImage = { id: string; src: string; alt: string; width: number; height: number; caption?: string; thumbnailSrc?: string };
export type ImageGalleryProps = { images: GalleryImage[]; selectedId?: string; defaultSelectedId?: string; onSelectedIdChange?: (id: string) => void; priority?: boolean; ariaLabel?: string; empty?: React.ReactNode; className?: string };

export default function ImageGallery({ images, selectedId, defaultSelectedId, onSelectedIdChange, priority = false, ariaLabel = "Image gallery", empty, className }: ImageGalleryProps) {
  const [currentId, select] = useControllableState({ value: selectedId, defaultValue: defaultSelectedId ?? images[0]?.id ?? "", onChange: onSelectedIdChange });
  if (images.length === 0) return <div className={className} data-vc-component="image-gallery" data-vc-slot="root" data-vc-state="empty" data-vc-empty>{empty}</div>;
  const current = images.find((image) => image.id === currentId) ?? images[0];
  return <section aria-label={ariaLabel} className={className} data-vc-component="image-gallery" data-vc-slot="root" data-vc-state="ready" data-vc-selected-id={current.id}>
    <figure data-vc-gallery-primary data-vc-slot="primary"><Image src={current.src} alt={current.alt} width={current.width} height={current.height} priority={priority} data-vc-slot="image" />{current.caption && <figcaption data-vc-slot="caption">{current.caption}</figcaption>}</figure>
    <div role="list" aria-label="Choose image" data-vc-gallery-thumbnails data-vc-slot="thumbnails">{images.map((image) => <div key={image.id} role="listitem" data-vc-slot="thumbnail-item"><button type="button" aria-label={`Show ${image.alt}`} aria-current={image.id === current.id ? "true" : undefined} onClick={() => select(image.id)} data-vc-gallery-thumbnail data-vc-slot="thumbnail"><Image src={image.thumbnailSrc ?? image.src} alt="" width={image.width} height={image.height} /></button></div>)}</div>
  </section>;
}
