"use client";

import Cropper, { type Area, type Point } from "react-easy-crop";
import { useState } from "react";

export type ImageCropperProps = { src: string; alt: string; aspect?: number; crop?: Point; defaultCrop?: Point; zoom?: number; defaultZoom?: number; onCropChange?: (crop: Point) => void; onZoomChange?: (zoom: number) => void; onCropComplete?: (area: Area, pixels: Area) => void; className?: string };

export default function ImageCropper({ src, alt, aspect = 1, crop, defaultCrop = { x: 0, y: 0 }, zoom, defaultZoom = 1, onCropChange, onZoomChange, onCropComplete, className }: ImageCropperProps) {
  const [internalCrop, setInternalCrop] = useState(defaultCrop);
  const [internalZoom, setInternalZoom] = useState(defaultZoom);
  const resolvedCrop = crop ?? internalCrop;
  const resolvedZoom = zoom ?? internalZoom;
  const changeCrop = (next: Point) => { if (crop === undefined) setInternalCrop(next); onCropChange?.(next); };
  const changeZoom = (next: number) => { if (zoom === undefined) setInternalZoom(next); onZoomChange?.(next); };
  return <div className={className} data-vc-component="image-cropper">
    <div role="img" aria-label={`Crop ${alt}`} style={{ aspectRatio: String(aspect) }} data-vc-crop-region>
      <Cropper image={src} crop={resolvedCrop} zoom={resolvedZoom} aspect={aspect} onCropChange={changeCrop} onZoomChange={changeZoom} onCropComplete={onCropComplete} />
    </div>
    <label>Zoom <input type="range" min={1} max={3} step={0.1} value={resolvedZoom} onChange={(event) => changeZoom(Number(event.currentTarget.value))} /></label>
  </div>;
}
